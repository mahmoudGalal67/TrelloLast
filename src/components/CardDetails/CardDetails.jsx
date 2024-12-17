import attach from "../../../public/attach.svg";
import deleteimage from "../../../public/delete.svg";
import coveru from "../../../public/coveru.svg";
import deleteDate from "../../../public/deleteDate.svg";
import deleteCover from "../../../public/deleteCover.svg";
import move from "../../../public/move.svg";
import copy from "../../../public/copy.svg";
import { GrAttachment } from "react-icons/gr";
import { CgDetailsMore } from "react-icons/cg";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { Modal as BootstrapModal } from "react-bootstrap"; // المكتبة الثانية

import ModalImage from "react-modal-image";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Form from "react-bootstrap/Form";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { AuthContext } from "../context/Auth";

import "./CardDetails.css";
import { useRef, useState, useContext } from "react";

import Cookies from "js-cookie";
import api from "../../apiAuth/auth";
import { Button, Dropdown, Spinner } from "react-bootstrap";
import Comment from "../comment/Comment";
import { FaRegCreditCard } from "react-icons/fa6";
import DragAndDropArea from "../DragAndDropArea";
import { MdDeleteForever } from "react-icons/md";

const CalendarIcon = () => {
  return (
    <div style={{ color: "white" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 48 48"
      >
        <mask id="ipSApplication0">
          <g fill="white" stroke="white" strokeLinejoin="round" strokeWidth="4">
            <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
            <path
              fill="White"
              d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
            ></path>
          </g>
        </mask>
        <path
          fill="white"
          d="M0 0h48v48H0z"
          mask="url(#ipSApplication0)"
        ></path>
      </svg>
      Date
    </div>
  );
};

function CardDetails({
  onCloseModal,
  open,
  listId,
  onDeleteCard,
  setcardDetails,
  cardDetails,
  board,
  files,
  setSelectedFile,
  setFullCover,
  cardCoverImg,
  setCardCoverImg,
}) {
  const toolbarOptions = [
    ["bold", "italic"],
    ["link", "image"],
  ];

  const module = {
    toolbar: toolbarOptions,
  };

  const cookies = Cookies.get("token");

  const { user } = useContext(AuthContext);

  const [activeMovinglist, setactiveMovinglist] = useState(
    board.lists_of_the_board[0].id
  );

  const [newPosotion, setnewPosotion] = useState(1);

  const [showdetails, setshowdetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editText, seteditText] = useState(false);
  const [addItems, setaddItems] = useState({
    title: false,
    desc: false,
    comment: false,
  });

  const [showCover, setShowCover] = useState(false);
  const handleShowCover = () => {
    setShowCover(true);
  };
  const handleCloseCover = () => {
    setShowCover(false);
  };

  const newComment = useRef(null);

  console.log("files", files);

  // changes
  const handleDelete = async () => {
    try {
      const response = await api({
        url: `/cards/destroy/${cardDetails.id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${cookies}` },
      });

      if (response.ok || response.status === 204 || response.status === 203) {
        console.log("Card deleted successfully");
        onDeleteCard(cardDetails.id);
        onCloseModal();
        alert("Card deleted successfully");
      } else {
        console.error(
          "Failed to delete the cardDetails. Status:",
          response.status
        );
      }
    } catch (error) {
      console.error("An error occurred while deleting the card:", error);
    }
  };

  const movingRequest = async (type) => {
    try {
      const response = await api({
        url:
          type == "move"
            ? `cards/move-card/${cardDetails.id}`
            : `cards/copy-card/${cardDetails.id}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "multipart/form-data",
        },
        data: { the_list_id: activeMovinglist, position: newPosotion },
      });
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  // توليد id باستخدام BigInt ويكون رقم موجب مع 20 رقم
  const fileId = BigInt(
    Math.abs(Date.now() * 1000 + Math.floor(Math.random() * 1000))
  );
  // console.log(files);
  const handleCoverUpload = async (event) => {
    let uploadedfiles = event?.target?.files || event;

    if (!uploadedfiles) return;

    const filesArray = Array.isArray(uploadedfiles)
      ? uploadedfiles
      : Array.from(uploadedfiles);

    console.log("Files received:", filesArray);
    filesArray.forEach((file, index) => {
      console.log(`File ${index}:`, file, "Type:", file.type);
    });

    // تأكد من أن الـ id يتم تعيينه بشكل صحيح لكل ملف باستخدام BigInt مع رقم مكون من 20 رقمًا
    setSelectedFile(
      filesArray
        .map((file) => {
          if (!(file instanceof File)) {
            console.error("Invalid file object:", file);
            return null;
          }

          try {
            // // توليد id باستخدام BigInt ويكون رقم موجب مع 20 رقم
            // const fileId = BigInt(
            //   Math.abs(Date.now() * 1000 + Math.floor(Math.random() * 1000))
            // );

            return {
              type: file.type,
              name: file.name,
              file_path: URL.createObjectURL(file),
              id: fileId, // إضافة id كمجموعة مكونة من 20 رقمًا
            };
          } catch (error) {
            console.error("Error creating object URL:", error, "File:", file);
            return null;
          }
        })
        .filter(Boolean)
    );

    try {
      const formData = new FormData();
      filesArray.forEach((file, index) => {
        formData.append("files[]", file);
        // تأكد من إضافة id الصحيح هنا
        if (fileId) {
          formData.append("id", fileId); // إرسال الـ id مع الملف
        }
      });
      formData.append("card_id", cardDetails.id);

      const response = await api({
        url: `/cards/store-files`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      console.log("files sent", response.data);
    } catch (error) {
      console.error(
        "Error uploading cover image:",
        error.response?.data || error.message
      );
    }
  };

  const openItem = (name) => {
    setaddItems((prev) => {
      return {
        ...prev,
        [name]: true,
      };
    });
  };
  const closeItem = (name) => {
    setaddItems((prev) => {
      return {
        ...prev,
        [name]: false,
      };
    });
  };

  const updateDate = async (name, value) => {
    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;
    setcardDetails((prev) => {
      return {
        ...prev,
        start_time: value,
      };
    });
    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...other,
          photo: other.photo ? other.photo.replace("/storage/", "") : "",
          card_id: cardDetails.id,
          the_list_id: listId,
          start_time: value,
        },
        method: "post",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateDetails = (name, value) => {
    setcardDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const updateDateState = async (e) => {
    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;
    setcardDetails((prev) => {
      return {
        ...prev,
        completed: e.target.checked,
      };
    });
    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...other,
          photo: other.photo ? other.photo.replace("/storage/", "") : "",
          card_id: cardDetails.id,
          the_list_id: listId,
          completed: e.target.checked,
        },
        method: "post",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // card cover img
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardCoverImg(URL.createObjectURL(file)); // عرض الصورة في الواجهة

      setcardDetails((prev) => ({
        ...prev,
        photo: file, // تخزين الملف
      }));
    }
    handleChangeCoverImgRequest(file);
  };

  const triggerFileInput = () => {
    document.getElementById("fileInput").click();
  };

  const handleChangeCoverImgRequest = async (file) => {
    const formData = new FormData();

    if (file) {
      formData.append("photo", file); // الملف
    }
    formData.append("card_id", cardDetails.id);
    formData.append("the_list_id", listId);

    try {
      const response = await api({
        url: "/cards/update",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "multipart/form-data",
        },
        data: formData,
        method: "POST",
      });

      const imageUrl = `https://back.alyoumsa.com/public/storage/${response.data.data.photo}`;
      setCardCoverImg(imageUrl); // تعيين الرابط الكامل للصورة
      alert("Cover updated successfully!");
      return true;
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      alert("Failed to update the cover. Please try again.");
      return false;
    }
  };

  const updateCoverColor = async (color, deleteColor) => {
    setcardDetails((prev) => ({
      ...prev,
      color: deleteColor ? "" : color,
    }));
  };

  const handleChangeColorRequest = async (color, deleteColor) => {
    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;

    const payload = {
      ...other,
      photo: other.photo ? other.photo.replace("/storage/", "") : null,
      card_id: cardDetails.id,
      the_list_id: listId,
      color: deleteColor ? "" : color, // استخدم اللون المستلم كمعامل
    };

    console.log("Payload being sent to the server:", payload);

    try {
      const response = await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: payload,
        method: "POST",
      });

      console.log("Server response:", response.data);
      alert("Cover updated successfully!");
      return true;
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      alert("Failed to update the cover. Please try again.");
      return false;
    }
  };

  const updateRequest = async (e) => {
    e.preventDefault();

    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;

    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...other,
          photo: other.photo ? other.photo.replace("/storage/", "") : "",
          card_id: cardDetails.id,
          the_list_id: listId,
        },
        method: "post",
      });
      closeItem("desc");
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    closeItem("comment");
    try {
      const { data } = await api({
        url: "/comments/create",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { card_id: cardDetails.id, comment: newComment.current.value },
        method: "post",
      });
      setcardDetails((prev) => {
        return {
          ...prev,
          comments: [
            ...prev.comments,
            { comment: data.result.comment, comment_id: data.result.id },
          ],
        };
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemoveCardFiles = async () => {
    try {
      const url = `/cards/delete-card-files/${cardDetails.id}`;
      const response = await api(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
        },
      });

      alert("all card files removed successfully");
      setSelectedFile([]);
      // setcardDetails((prev) => ({
      //   ...prev,
      //   photo: "",
      // }));
    } catch (error) {
      console.error("Error removing card files:", error);
    }
  };

  const handleRemoveOneFileFromCard = async (fileId) => {
    try {
      const url = `/cards/delete-file/${fileId}`;
      const response = await api(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
        },
      });

      alert("the file removed successfully");
      setSelectedFile(files.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error removing the file:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center position-fixed top-0 left-0">
        <Spinner animation="border" role="status" variant="primary" size="md">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <Modal classNames="card-modal" open={open} onClose={onCloseModal} center>
        <div className="modal-body w-100" style={{ color: "#b6c2cf" }}>
          <div
            className="cover-image"
            style={{
              background: cardDetails.color,
              height: "116px",
            }}
          ></div>
          <div
            className="cover"
            style={{
              position: "absolute",
              right: "20px",
              top: "80px",
            }}
          >
            <button
              onClick={handleShowCover}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                gap: "5px",
                alignItems: "center",
                fontSize: "14px",
                color: "#b6c2cf",
              }}
            >
              <FaRegCreditCard />
              cover
            </button>
          </div>

          {editText ? (
            <form onSubmit={updateRequest}>
              <input
                required
                style={{ width: "60%", marginBottom: "15px" }}
                value={cardDetails.text}
                autoFocus
                onChange={(e) => updateDetails("text", e.target.value)}
                onBlur={() => seteditText(false)}
              />
            </form>
          ) : (
            <h2
              style={{
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
              onClick={() => seteditText(true)}
            >
              <FaRegCreditCard />
              {cardDetails.text}
            </h2>
          )}

          <div className="wrapper">
            <div className="left">
              {cardDetails.start_time && (
                <div className="date-wrapper">
                  <Form.Check
                    type="checkbox"
                    checked={cardDetails.completed}
                    onChange={updateDateState}
                  />
                  <div className="state-wrapper">
                    <DatePicker
                      showTimeSelect={false}
                      showTimeInput
                      dateFormat="MM/dd/yyyy h:mm aa"
                      selected={cardDetails.start_time}
                      onChange={(e) => updateDate("start_time", e)}
                    />
                    {cardDetails.completed ? (
                      <div className="state">Completed</div>
                    ) : (new Date(cardDetails.start_time) - new Date()) /
                        (1000 * 60 * 60 * 24) >
                      1 ? (
                      <div
                        className="state"
                        style={{ background: "transparent" }}
                      ></div>
                    ) : (new Date(cardDetails.start_time) - new Date()) /
                        (1000 * 60 * 60 * 24) >
                      0 ? (
                      <div className="state" style={{ background: "yellow" }}>
                        Soon
                      </div>
                    ) : (
                      <div className="state" style={{ background: "red" }}>
                        Over Date
                      </div>
                    )}
                  </div>
                  <img
                    src={deleteDate}
                    style={{ width: "20px", cursor: "pointer" }}
                    onClick={() => updateDate("start_time", "")}
                    alt=""
                  />
                </div>
              )}
              <div className="description">
                <h3
                  className="header"
                  onClick={() => openItem("desc")}
                  style={{
                    fontSize: "16px",
                    padding: "6px 0",
                    cursor: "pointer",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <CgDetailsMore />
                  Description
                </h3>

                <form onSubmit={updateRequest}>
                  {addItems.desc ? (
                    <>
                      <ReactQuill
                        theme="snow"
                        modules={module}
                        value={cardDetails.description}
                        onChange={(e) => updateDetails("description", e)}
                      />
                      <div className="wrapper" style={{ margin: "16px 0" }}>
                        <button type="submit" className="save">
                          Save
                        </button>
                        <button
                          name="desc"
                          onClick={(e) => closeItem(e.target.name)}
                          className="cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : cardDetails.description ? (
                    <>
                      <div
                        className="desc-content"
                        style={{ width: "500px", overflow: "hidden" }}
                        onClick={() => openItem("desc")}
                        dangerouslySetInnerHTML={{
                          __html: cardDetails.description,
                        }}
                      />
                    </>
                  ) : (
                    <div className="addDesc" onClick={() => openItem("desc")}>
                      Add Your description
                    </div>
                  )}
                </form>
              </div>

              <div
                className="details"
                onClick={() => setshowdetails((prev) => !prev)}
              >
                {showdetails ? "Hide" : "Show"} Details
              </div>

              {showdetails && (
                <div className="details-wrapper">
                  {cardDetails.card_details.map((item, i) => (
                    <div className="wrapper" key={i}>
                      <div className="user-info">
                        {item.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="info">
                        <span className="user-name">{item.user_name}</span>
                        <span>{item.description}</span>
                        <p>{item.created_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="comments">
                {!addItems.comment ? (
                  <input
                    style={{ caretColor: "transparent" }}
                    className="comment add-comment"
                    type="text"
                    placeholder="Write a comment…"
                    data-testid="card-back-new-comment-input-skeleton"
                    aria-placeholder="Write a comment…"
                    aria-label="Write a comment"
                    read-only="true"
                    value="Enter your Comment"
                    name="comment"
                    readOnly
                    onClick={(e) => openItem(e.target.name)}
                  ></input>
                ) : (
                  <form onSubmit={addComment} className="add-comments">
                    <ReactQuill
                      theme="snow"
                      modules={module}
                      ref={newComment}
                      required
                      autoFocus
                      placeholder="Write a comment…"
                    />

                    <div
                      className="wrapper"
                      style={{ flexDirection: "row", margin: "16px 0" }}
                    >
                      <button type="submit" className="save">
                        Save
                      </button>
                      <button
                        name="comment"
                        onClick={(e) => closeItem(e.target.name)}
                        className="cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="wrapper">
                  {cardDetails.comments?.map((comment, i) => (
                    <div key={i}>
                      <Comment
                        comment={comment}
                        user={user}
                        cardId={cardDetails.id}
                        setcardDetails={setcardDetails}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* files */}
              <div className="Attachments">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      padding: "6px 0",
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    <GrAttachment />
                    Attachments
                  </h3>
                  <input
                    type="file"
                    id="uploadCover"
                    multiple
                    onChange={handleCoverUpload}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="uploadCover"
                    style={{
                      backgroundColor: "#a1bdd914",
                      border: "none",
                      color: "#b6c2cf",
                      width: "50px",
                      height: "32px",
                      borderRadius: "3px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    add
                  </label>
                </div>

                <DragAndDropArea handleUploadFile={handleCoverUpload}>
                  <div
                    style={{
                      margin: "25px",
                      color: "#959b99",
                      paddingRight: "24px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {files &&
                      files?.map((file) => {
                        if (
                          file.type === "application/pdf" ||
                          file.file_path.includes("pdf")
                        ) {
                          return (
                            <div
                              className="fileBox"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#b6c2cf",
                              }}
                              key={file.name}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#b6c2cf",
                                }}
                              >
                                <div
                                  style={{
                                    width: "64px",
                                    height: "48px",
                                    backgroundColor: "#a1bdd914",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    borderRadius: "5px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    color: "#9fadbc",
                                  }}
                                >
                                  PDF
                                </div>
                                <Popup
                                  trigger={
                                    <div> {file.name || file.file_path} </div>
                                  }
                                  position="right center"
                                  key={file.name}
                                >
                                  <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
                                    <Viewer
                                      fileUrl={
                                        !file.type
                                          ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                          : file.file_path
                                      }
                                    />
                                  </Worker>
                                </Popup>
                              </div>
                              <Button
                                variant="danger"
                                style={{
                                  fontSize: "22px",
                                  width: "34px",
                                  height: "34px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: "0",
                                }}
                                onClick={() => {
                                  if (file.id) {
                                    handleRemoveOneFileFromCard(file.id);
                                  } else {
                                    console.error(
                                      "File ID is missing for file:",
                                      file
                                    );
                                  }
                                }}
                              >
                                <MdDeleteForever />
                              </Button>
                            </div>
                          );
                        }
                        if (
                          file?.type?.startsWith("image/") ||
                          file.file_path.includes(".jpg") ||
                          file.file_path.includes(".webp") ||
                          file.file_path.includes(".gif") ||
                          file.file_path.includes(".svg")
                        ) {
                          return (
                            <div
                              // className="cover-image"
                              key={file.file_path}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#b6c2cf",
                                height: "100px !important",
                              }}
                            >
                              <div
                                style={{
                                  objectFit: "cover",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#b6c2cf",
                                  width: "100px",
                                  height: "100px !important",
                                  overflow: "hidden", // لمنع تجاوز الصورة للحجم المحدد
                                  borderRadius: "12px", // اختياري لتنسيق الحواف
                                }}
                              >
                                <ModalImage
                                  small={
                                    !file.type
                                      ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                      : file.file_path
                                  }
                                  large={
                                    !file.type
                                      ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                      : file.file_path
                                  }
                                  alt="cover Image"
                                  hideDownload={true}
                                  hideZoom={false}
                                />
                              </div>

                              <p>{file.name}</p>

                              <Button
                                variant="danger"
                                style={{
                                  fontSize: "22px",
                                  width: "34px",
                                  height: "34px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: "0",
                                }}
                                onClick={() => {
                                  if (file.id) {
                                    handleRemoveOneFileFromCard(file.id);
                                  } else {
                                    console.error(
                                      "File ID is missing for file:",
                                      file
                                    );
                                  }
                                }}
                              >
                                <MdDeleteForever />
                              </Button>
                            </div>
                          );
                        }

                        if (
                          file.file_path.includes(".mp4") ||
                          file.type?.startsWith("video/")
                        ) {
                          return (
                            <div className="cover-image" key={file.file_path}>
                              <video
                                controls
                                src={
                                  !file.type
                                    ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                    : file.file_path
                                }
                                style={{ width: "300px" }}
                              />
                              <Button
                                variant="danger"
                                style={{
                                  fontSize: "22px",
                                  width: "34px",
                                  height: "34px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: "0",
                                }}
                                onClick={() =>
                                  handleRemoveOneFileFromCard(file.id)
                                }
                              >
                                <MdDeleteForever />
                              </Button>
                            </div>
                          );
                        }
                        if (
                          file.file_path.includes(".zip") ||
                          file.type == "application/x-zip-compressed"
                        ) {
                          return (
                            <div key={file.name}>
                              <a
                                href={
                                  !file.type
                                    ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                    : file.file_path
                                }
                                download={file.name}
                              >
                                Download {file.name}
                              </a>
                              <Button
                                variant="danger"
                                style={{
                                  fontSize: "22px",
                                  width: "34px",
                                  height: "34px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: "0",
                                }}
                                onClick={() =>
                                  handleRemoveOneFileFromCard(file.id)
                                }
                              >
                                <MdDeleteForever />
                              </Button>
                            </div>
                          );
                        }
                      })}
                  </div>
                </DragAndDropArea>
              </div>
            </div>

            <div className="right">
              <input
                type="file"
                id="uploadCover"
                multiple
                onChange={handleCoverUpload}
                style={{ display: "none" }}
              />

              {files && (
                <div className="item" onClick={handleRemoveCardFiles}>
                  <img src={deleteCover} alt="Cover" />
                  Remove all Attachments
                </div>
              )}

              <div className="item">
                <label
                  htmlFor="uploadCover"
                  style={{ width: "100%", cursor: "pointer" }}
                >
                  <img src={attach} alt="Cover" />
                  Update Attachment
                </label>
              </div>

              <div className="item date" style={{ padding: "3px" }}>
                <DatePicker
                  showIcon
                  selected=""
                  onChange={(e) => updateDate("start_time", e)}
                  dateFormat="MM/dd/yyyy h:mm aa"
                  icon={CalendarIcon}
                />
                <span>Date</span>
              </div>
              <div className="item" onClick={handleDelete}>
                <img src={deleteimage} alt="Delete" /> Delete
              </div>

              <div className="item move">
                <Dropdown autoClose="outside">
                  <Dropdown.Toggle
                    className="custom-dropdown-toggle p-0 no-caret"
                    as="button"
                  >
                    <img src={move} alt="Delete" /> Move
                  </Dropdown.Toggle>
                  <Dropdown.Menu drop="start">
                    <Dropdown.Item>
                      <div>
                        <label htmlFor="">List</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setactiveMovinglist(e.target.value)}
                        >
                          {board.lists_of_the_board.map((list) => (
                            <option key={list.id} value={list.id}>
                              {list.title}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div>
                        <label htmlFor="">Position</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setnewPosotion(e.target.value)}
                        >
                          {Array(
                            board.lists_of_the_board.find(
                              (item) => item.id == activeMovinglist
                            ).cards_of_the_list.length + 1
                          )
                            .fill(1)
                            .map((item, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                        </Form.Select>
                      </div>
                    </Dropdown.Item>
                    <Button
                      style={{ width: "60px", margin: "15px" }}
                      variant="primary"
                      size="sm"
                      onClick={() => movingRequest("move")}
                    >
                      Move
                    </Button>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="item move">
                <Dropdown autoClose="outside">
                  <Dropdown.Toggle
                    className="custom-dropdown-toggle p-0 no-caret"
                    as="button"
                  >
                    <img src={copy} alt="copy" /> copy
                  </Dropdown.Toggle>
                  <Dropdown.Menu drop="start">
                    <Dropdown.Item>
                      <div>
                        <label htmlFor="">List</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setactiveMovinglist(e.target.value)}
                        >
                          {board.lists_of_the_board.map((list) => (
                            <option key={list.id} value={list.id}>
                              {list.title}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div>
                        <label htmlFor="">Position</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setnewPosotion(e.target.value)}
                        >
                          {Array(
                            board.lists_of_the_board.find(
                              (item) => item.id == activeMovinglist
                            ).cards_of_the_list.length + 1
                          )
                            .fill(1)
                            .map((item, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                        </Form.Select>
                      </div>
                    </Dropdown.Item>
                    <Button
                      style={{ width: "60px", margin: "15px" }}
                      variant="primary"
                      size="sm"
                      onClick={() => movingRequest("copy")}
                    >
                      Copy
                    </Button>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <BootstrapModal
        show={showCover}
        onHide={handleCloseCover}
        className="cover-modal"
      >
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>cover</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            backgroundColor: "#282e33",
            gap: "20px",
            padding: "30px 0",
            borderRadius: "5px",
          }}
        >
          <section className="size-sec">
            <h5
              style={{
                color: "#9fadbc",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              Size
            </h5>
            <div className="sizesBox">
              <button
                style={{
                  background: cardDetails?.color
                    ? cardDetails?.color
                    : "#454f59",
                  width: "134px",
                  height: "62px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "none",
                  display: "flex",
                  gap: "5px",
                }}
                onClick={() => setFullCover(false)}
              >
                <div
                  style={{
                    background: cardDetails?.color ? "#22272b" : "#22272b",
                    alignSelf: "flex-end",
                    height: "30px",
                    width: "100%",
                    padding: "10px",
                    display: "flex",
                    gap: "5px",
                    flexDirection: "column",
                  }}
                >
                  <p
                    style={{
                      background: "#596773",
                      height: "4px",
                      width: "116px",
                      borderRadius: "5px",
                    }}
                  ></p>
                  <p
                    style={{
                      background: "#596773",
                      height: "4px",
                      width: "66px",
                      borderRadius: "5px",
                    }}
                  ></p>
                </div>
              </button>
              <button
                style={{
                  background: cardDetails?.color
                    ? cardDetails?.color
                    : "#454f59",
                  width: "134px",
                  height: "62px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "none",
                  display: "flex",
                  gap: "5px",
                }}
                onClick={() => setFullCover(true)}
              >
                <div
                  style={{
                    background: "transparent",
                    alignSelf: "flex-end",
                    height: "30px",
                    width: "100%",
                    padding: "10px",
                    display: "flex",
                    gap: "5px",
                    flexDirection: "column",
                  }}
                >
                  <p
                    style={{
                      background: "#596773",
                      height: "4px",
                      width: "116px",
                      borderRadius: "5px",
                    }}
                  ></p>
                  <p
                    style={{
                      background: "#596773",
                      height: "4px",
                      width: "66px",
                      borderRadius: "5px",
                    }}
                  ></p>
                </div>
              </button>
            </div>
            <button
              style={{
                background: "#596773",
                width: "100%",
                borderRadius: "5px",
                border: "none",
                marginTop: "12px",
                fontSize: "14px",
                color: "#b6c2cf",
                padding: "6px",
                fontWeight: "bold",
              }}
              onClick={() => {
                updateCoverColor("", true);
                handleChangeColorRequest("", true);
              }}
            >
              Remove Cover
            </button>
          </section>

          <section className="colors-sec">
            <h5
              style={{
                color: "#9fadbc",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              Colors
            </h5>
            <div className="colorsBox">
              <button
                className="color"
                style={{
                  backgroundColor: "#216e4e",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",

                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#216e4e", false);
                  handleChangeColorRequest("#216e4e", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#7f5f01",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#7f5f01", false);
                  handleChangeColorRequest("#7f5f01", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#a54800",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#a54800", false);
                  handleChangeColorRequest("#a54800", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#ae2e24",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#ae2e24", false);
                  handleChangeColorRequest("#ae2e24", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#5e4db2",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#5e4db2", false);
                  handleChangeColorRequest("#5e4db2", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#0055cc",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#0055cc", false);
                  handleChangeColorRequest("#0055cc", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#206a83",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#206a83", false);
                  handleChangeColorRequest("#206a83", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#4c6b1f",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#4c6b1f", false);
                  handleChangeColorRequest("#4c6b1f", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#943d73",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#943d73", false);
                  handleChangeColorRequest("#943d73", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
              <button
                className="color"
                style={{
                  backgroundColor: "#596773",
                  width: "50px",
                  height: "32px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  border: "2px transparent solid",
                }}
                onClick={() => {
                  updateCoverColor("#596773", false);
                  handleChangeColorRequest("#596773", false); // احفظ اللون مباشرة عند تغييره
                }}
              ></button>
            </div>

            <h5
              style={{
                color: "#9fadbc",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Attachments
            </h5>
            {cardCoverImg && (
              <img
                src={cardCoverImg}
                alt="Cover Preview"
                style={{
                  width: "88px",
                  height: "48px",
                  marginBottom: "4px",
                  borderRadius: "3px",
                  objectFit: "contain",
                  backgroundColor: "white", // استخدم فقط backgroundColor
                }}
              />
            )}

            <input
              type="file"
              accept="image/*"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              style={{
                background: "#596773",
                width: "100%",
                borderRadius: "5px",
                border: "none",
                marginTop: "12px",
                fontSize: "14px",
                color: "#b6c2cf",
                padding: "6px",
                fontWeight: "bold",
              }}
              onClick={triggerFileInput}
            >
              upload a cover image
            </button>
          </section>
        </BootstrapModal.Body>
      </BootstrapModal>
    </div>
  );
}

export default CardDetails;
