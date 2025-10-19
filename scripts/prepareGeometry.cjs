// scripts/prepareGeometry.js
const fs = require('fs');
const proj4 = require('proj4');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256'); // for MerkleTree hashing
const { solidityPacked, keccak256: ethersKeccak256 } = require('ethers'); // ethers v6 style
const yargs = require('yargs');

const argv = yargs
  .option('input', { alias: 'i', type: 'string', demandOption: true, describe: 'Input GeoJSON-like file (Polygon coordinates array)' })
  .option('scale', { alias: 's', type: 'number', default: 1000, describe: 'Integer scale for coordinates (e.g. 1000 -> mm precision)' })
  .option('output', { alias: 'o', type: 'string', default: 'prepared.json', describe: 'Output JSON' })
  .argv;

function ensureRing(coords) {
  const last = coords[coords.length - 1];
  if (last[0] === coords[0][0] && last[1] === coords[0][1]) {
    return coords.slice(0, -1);
  }
  return coords;
}

function utmProjString(zone, lat) {
  return `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs${lat < 0 ? ' +south' : ''}`;
}

function lonLatToUTM(lon, lat) {
  const zone = Math.floor((lon + 180) / 6) + 1;
  const from = 'EPSG:4326';
  const to = utmProjString(zone, lat);
  return proj4(from, to, [lon, lat]);
}

function rotateToMinXY(arr) {
  let minIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][0] < arr[minIdx][0] || (arr[i][0] === arr[minIdx][0] && arr[i][1] < arr[minIdx][1])) {
      minIdx = i;
    }
  }
  return arr.slice(minIdx).concat(arr.slice(0, minIdx));
}

function signedShoelaceSum(intCoords) {
  const n = intCoords.length;
  let acc = 0n;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = BigInt(intCoords[i][0]);
    const yi = BigInt(intCoords[i][1]);
    const xj = BigInt(intCoords[j][0]);
    const yj = BigInt(intCoords[j][1]);
    acc += xi * yj - xj * yi;
  }
  return acc;
}

function toBigIntSafe(val) {
  return BigInt(val);
}

(async () => {
  const inputPath = argv.input;
  const SCALE = argv.scale;
  const outputPath = argv.output;

  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  let coords;
  if (raw.type && raw.type === 'Polygon' && raw.coordinates) {
    coords = raw.coordinates[0];
  } else if (Array.isArray(raw)) {
    coords = raw;
  } else {
    throw new Error('Input JSON must be GeoJSON Polygon or array of [lon,lat] coords');
  }

  coords = ensureRing(coords);

  const coordsMeters = coords.map(([lon, lat]) => {
    const [x, y] = lonLatToUTM(lon, lat);
    return [x, y];
  });

  const intCoords = coordsMeters.map(([x, y]) => {
    const xi = Math.round(x * SCALE);
    const yi = Math.round(y * SCALE);
    return [xi, yi];
  });

  let canon = rotateToMinXY(intCoords.slice());

  const sum = signedShoelaceSum(canon);
  if (sum < 0n) {
    canon = canon.reverse();
    canon = rotateToMinXY(canon);
  }

  const acc = signedShoelaceSum(canon);
  const areaTimes2 = acc < 0n ? -acc : acc;
  const areaScaledFloor = areaTimes2 / 2n;

  const leavesHex = canon.map(([x, y]) => {
    const packed = solidityPacked(['int256', 'int256'], [x.toString(), y.toString()]);
    const leaf = ethersKeccak256(packed);
    return leaf;
  });

  const leavesBuf = leavesHex.map(h => Buffer.from(h.slice(2), 'hex'));
  const tree = new MerkleTree(leavesBuf, keccak256, { sortPairs: true });
  const rootBuf = tree.getRoot();
  const merkleRoot = '0x' + rootBuf.toString('hex');

  const proofs = leavesBuf.map(l => tree.getHexProof(l));

  const out = {
    meta: {
      scale: SCALE,
      vertexCount: canon.length,
      note: 'areaTimes2 = 2 * area_in_scaled_units; area_in_m2 = areaTimes2 / (2 * SCALE^2)'
    },
    coordsMeters: coordsMeters.map(([x, y]) => [x, y]),
    intCoords: canon,
    leavesHex,
    merkleRoot,
    proofs,
    areaTimes2: areaTimes2.toString(),
    areaScaledFloor: areaScaledFloor.toString()
  };

  fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
  console.log('Prepared geometry written to', outputPath);
  console.log('merkleRoot:', merkleRoot);
  console.log('vertexCount:', canon.length);
  console.log('areaTimes2 (scaled*2):', out.areaTimes2);
})();
