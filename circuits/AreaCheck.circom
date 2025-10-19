pragma circom 2.0.0;

include "../circomlib/circuits/comparators.circom";

// Template untuk cek luas poligon pakai shoelace
template AreaCheckMain(n) {
    signal input x[n];
    signal input y[n];
    signal input expectedArea;   // publik

    signal term1[n];
    signal term2[n];
    signal shoelace[n];
    signal partialSum[n+1];

    partialSum[0] <== 0;

    for (var i = 0; i < n; i++) {
        var j = (i + 1) % n;

        term1[i] <== x[i] * y[j];
        term2[i] <== x[j] * y[i];

        shoelace[i] <== term1[i] - term2[i];
        partialSum[i+1] <== partialSum[i] + shoelace[i];
    }

    signal sum;
    sum <== partialSum[n];

    // cek apakah sum >= 0
    component isNonNeg = LessThan(252);
    isNonNeg.in[0] <== 0;
    isNonNeg.in[1] <== sum;

    // absolute value pakai step by step (quadratic)
    signal negSum;
    negSum <== -sum;

    signal oneMinusSel;
    oneMinusSel <== 1 - isNonNeg.out;

    signal left;
    left <== oneMinusSel * negSum;

    signal right;
    right <== isNonNeg.out * sum;

    signal absSum;
    absSum <== left + right;

    // enforce
    expectedArea === absSum;
}

component main = AreaCheckMain(4);
