import json
from xml.dom.minidom import Document

def json_to_kml(json_file, kml_file):
    with open(json_file, "r", encoding="utf-8") as f:
        hospitals = json.load(f)

    doc = Document()
    kml = doc.createElement("kml")
    kml.setAttribute("xmlns", "http://www.opengis.net/kml/2.2")
    doc.appendChild(kml)

    kml_doc = doc.createElement("Document")
    kml.appendChild(kml_doc)

    for hospital in hospitals:
        placemark = doc.createElement("Placemark")

        # Nama
        name = doc.createElement("name")
        name.appendChild(doc.createTextNode(hospital.get("name", "Tanpa Nama")))
        placemark.appendChild(name)

        # Deskripsi
        description = doc.createElement("description")
        desc_text = hospital.get("description", "") + "<br/><br/>"
        for attr in hospital.get("attributes", []):
            desc_text += f"<b>{attr.get('trait_type','')}:</b> {attr.get('value','')}<br/>"
        description.appendChild(doc.createTextNode(desc_text))
        placemark.appendChild(description)

        # Titik lokasi
        if "location" in hospital:
            loc = hospital["location"]
            lon, lat = loc.get("longitude"), loc.get("latitude")
            if lon is not None and lat is not None:
                point = doc.createElement("Point")
                coordinates = doc.createElement("coordinates")
                coordinates.appendChild(doc.createTextNode(f"{lon},{lat},0"))
                point.appendChild(coordinates)
                placemark.appendChild(point)

        # Polygon area (jika ada)
        if "polygon" in hospital:
            poly = hospital["polygon"]
            if isinstance(poly, list) and len(poly) >= 3:
                polygon = doc.createElement("Polygon")
                outer = doc.createElement("outerBoundaryIs")
                ring = doc.createElement("LinearRing")
                coordinates = doc.createElement("coordinates")
                
                coord_str = " ".join([f"{p[0]},{p[1]},0" for p in poly])
                coordinates.appendChild(doc.createTextNode(coord_str))
                
                ring.appendChild(coordinates)
                outer.appendChild(ring)
                polygon.appendChild(outer)
                placemark.appendChild(polygon)

        kml_doc.appendChild(placemark)

    with open(kml_file, "w", encoding="utf-8") as f:
        f.write(doc.toprettyxml(indent="  "))

    print(f"✅ KML berhasil dibuat: {kml_file}")


if __name__ == "__main__":
    json_to_kml("hospitals.json", "hospitals.kml")
