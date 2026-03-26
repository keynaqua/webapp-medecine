def attach_images_to_questions(qcms, anchors, images, total_pages):
    qcm_map = {q["number"]: q for q in qcms}

    anchors_by_page = {}
    for anchor in anchors:
        anchors_by_page.setdefault(anchor["page"], []).append(anchor)

    images_by_page = {}
    for image in images:
        images_by_page.setdefault(image["page"], []).append(image)

    current_qcm = None

    for page in range(1, total_pages + 1):
        page_anchors = anchors_by_page.get(page, [])
        page_images = images_by_page.get(page, [])

        anchor_index = 0

        for image in page_images:
            image_y = image["bbox"][1]

            while (
                anchor_index < len(page_anchors)
                and page_anchors[anchor_index]["bbox"][1] <= image_y
            ):
                current_qcm = page_anchors[anchor_index]["number"]
                anchor_index += 1

            if current_qcm not in qcm_map:
                continue

            qcm = qcm_map[current_qcm]

            if qcm["type"] == "image_association":
                qcm["targets"].append({
                    "letter": image.get("label"),
                    "image": image["url"]
                })
            else:
                qcm.setdefault("images", []).append({
                    "label": image.get("label"),
                    "url": image["url"]
                })

        while anchor_index < len(page_anchors):
            current_qcm = page_anchors[anchor_index]["number"]
            anchor_index += 1

    for qcm in qcms:
        if qcm.get("type") == "image_association":
            qcm["targets"].sort(key=lambda item: (item["letter"] or "Z"))

    return qcms
