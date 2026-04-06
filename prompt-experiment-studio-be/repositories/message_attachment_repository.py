from sqlalchemy.orm import Session
from models.message_attachment import MessageAttachmentModel


def _get_value(image, key: str):
    if isinstance(image, dict):
        return image[key]
    return getattr(image, key)


def create_attachments(
    db: Session,
    message_id: int,
    images: list,
) -> list[MessageAttachmentModel]:
    rows: list[MessageAttachmentModel] = []

    for image in images:
        row = MessageAttachmentModel(
            message_id=message_id,
            name=_get_value(image, "name"),
            mime_type=_get_value(image, "mime_type"),
            data_url=_get_value(image, "data_url"),
            is_pinned=False,
        )
        db.add(row)
        rows.append(row)

    db.commit()

    for row in rows:
        db.refresh(row)

    return rows


def list_attachments_by_message(
    db: Session,
    message_id: int,
) -> list[MessageAttachmentModel]:
    return (
        db.query(MessageAttachmentModel)
        .filter(MessageAttachmentModel.message_id == message_id)
        .order_by(
            MessageAttachmentModel.created_at.asc(), MessageAttachmentModel.id.asc()
        )
        .all()
    )
