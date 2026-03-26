def attach_images_to_questions(qcms, anchors, images, total_pages):
    qcm_map = {q["number"]: q for q in qcms}

    anchors_by_page = {}
    for a in anchors:
        anchors_by_page.setdefault(a["page"], []).append(a)

    images_by_page = {}
    for img in images:
        images_by_page.setdefault(img["page"], []).append(img)

    current_qcm = None

    for page in range(1, total_pages + 1):
        page_anchors = anchors_by_page.get(page, [])
        page_images = images_by_page.get(page, [])

        anchor_index = 0

        for img in page_images:
            img_y = img["bbox"][1]

            while (
                anchor_index < len(page_anchors)
                and page_anchors[anchor_index]["bbox"][1] <= img_y
            ):
                current_qcm = page_anchors[anchor_index]["number"]
                anchor_index += 1

            if current_qcm in qcm_map:
                qcm_map[current_qcm]["images"].append(img["url"])

        while anchor_index < len(page_anchors):
            current_qcm = page_anchors[anchor_index]["number"]
            anchor_index += 1

    return qcms