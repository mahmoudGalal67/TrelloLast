import React, { useState, useEffect } from "react";
import "./card.css";
import CardDetails from "../CardDetails/CardDetails";
import api from "../../apiAuth/auth";

import Cookies from "js-cookie";
import { MdOutlineEdit } from "react-icons/md";
import { GrAttachment } from "react-icons/gr";

const Card = React.memo(
  ({ card, onCardDelete, listId, board, show, setShow }) => {
    const [open, setOpen] = useState(false); // حالة المودال

    const [selectedFile, setSelectedFile] = useState([]);

    const [fullCover, setFullCover] = useState(false);
    const [cardCoverImg, setCardCoverImg] = useState(null);

    const cookies = Cookies.get("token");

    const onOpenModal = () => {
      setOpen(true);
    };
    const onCloseModal = () => setOpen(false);

    const handleDeleteCard = (id) => {
      onCardDelete(id);
      onCloseModal();
    };

    const [cardDetails, setcardDetails] = useState({});

    useEffect(() => {
      const fetchcarddetails = async () => {
        try {
          const { data } = await api({
            url: `cards/get-card/${card.id}`,
            headers: { Authorization: `Bearer ${cookies}` },
          });
          setcardDetails(data.data);
          setSelectedFile(data?.files);
        } catch (err) {
          console.log(err);
        }
      };
      fetchcarddetails();
    }, [card.id]);

    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = (newText) => {
      setcardDetails((prev) => ({
        ...prev,
        text: newText,
      }));
    };

    // حفظ النص عند انتهاء التعديل
    const saveEdit = async () => {
      setIsEditing(false);
      // عند حفظ التعديل، يمكنك إضافة طلب API لحفظ التغيير إذا كان مطلوبًا
      try {
        const response = await api({
          method: "POST",
          url: "cards/update",
          headers: { Authorization: `Bearer ${cookies}` },
          data: {
            card_id: card.id,
            text: cardDetails.text,
            the_list_id: listId,
          },
        });
      } catch (error) {
        console.log(card.id);
        console.error("Error saving the updated text:", error);
      }
    };

    // التعامل مع الحدث عند الضغط على الأيقونة
    const handleEditClick = (e) => {
      e.stopPropagation(); // منع الحدث من الانتشار
      setIsEditing(true); // تفعيل وضع التعديل
    };

    // التعامل مع الحدث عند الضغط على الحقل
    const handleInputClick = (e) => {
      e.stopPropagation(); // منع الحدث من الانتشار عند الضغط على الحقل
    };

    return (
      <>
        <div className="item" onClick={onOpenModal}>
          {cardDetails.color ? (
            <div
              className="cover-image"
              style={{
                background: `${cardDetails.color}`, // استخدام الصورة كخلفية
                height: fullCover ? "80px" : "40px", // إذا كانت الصورة موجودة
              }}
            ></div>
          ) : cardCoverImg ? ( // إذا كان هناك رابط للصورة
            <div
              className="cover-image"
              style={{
                background: `url(${cardCoverImg})`, // استخدام الصورة كخلفية
                height: fullCover ? "80px" : "40px", // إذا كانت الصورة موجودة
              }}
            ></div>
          ) : cardDetails.photo ? (
            <div
              className="cover-image"
              style={{
                background: `url(https://back.alyoumsa.com/public/${cardDetails.photo})`, // استخدام الصورة كخلفية
                height: fullCover ? "80px" : "40px", // إذا كانت الصورة موجودة
              }}
            ></div>
          ) : (
            <></>
          )}
          <div className="card-text">
            {isEditing ? (
              <input
                type="text"
                value={cardDetails.text}
                onChange={(e) => handleEdit(e.target.value)} // تحديث القيمة عند التعديل
                onBlur={() => setIsEditing(false)} // حفظ التعديل عند فقدان التركيز
                onClick={handleInputClick} // إضافة stopPropagation هنا
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveEdit(); // حفظ التعديل عند الضغط على Enter
                  }
                }}
                autoFocus
              />
            ) : (
              <p>{cardDetails.text}</p>
            )}
            {/* أيقونة التعديل */}
            <MdOutlineEdit onClick={handleEditClick} />
          </div>
        </div>
        <CardDetails
          onCloseModal={onCloseModal}
          listId={listId}
          open={open}
          cardDetails={cardDetails}
          setcardDetails={setcardDetails}
          onDeleteCard={handleDeleteCard}
          board={board}
          files={selectedFile}
          setSelectedFile={setSelectedFile}
          setFullCover={setFullCover}
          setCardCoverImg={setCardCoverImg}
          cardCoverImg={cardCoverImg}
        />
      </>
    );
  }
);

// Set displayName for debugging purposes
Card.displayName = "CardComponent";

export default Card;
