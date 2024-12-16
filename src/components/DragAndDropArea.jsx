import React, { useState } from "react";

const DragAndDropArea = ({ handleUploadFile, children }) => {
  // const [droppedFile, setDroppedFile] = useState(null); // تخزين الملف
  // const [filePreview, setFilePreview] = useState(""); // عرض معاينة للملفات القابلة للعرض (مثل الصور)

  const handleDragOver = (e) => {
    e.preventDefault();
  };

 const handleDrop = (e) => {
   e.preventDefault();
   const files = [];
   const items = e.dataTransfer.items;

   if (items) {
     for (let i = 0; i < items.length; i++) {
       if (items[i].kind === "file") {
         const file = items[i].getAsFile();
         if (file) files.push(file); // التحقق من صحة الملف قبل الإضافة
       }
     }
   }
   handleUploadFile(files);
 };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: "100%",
        minHeight: "300px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        // justifyContent: "center",
        textAlign: "center",
        margin: "30px 0",
        flexDirection: "column",
        gap:'20px',
        padding:'20px 0'
      }}
    >
      {/*  {filePreview ? (
        <img
          src={filePreview}
          alt="Preview"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "cover",
          }}
        />
      ) : droppedFile ? (
        <p>
          {droppedFile.name} ({(droppedFile.size / 1024).toFixed(2)} KB)
        </p>
      ) : (
        <p>You can also drag and drop files here to upload them.</p>
      )}
        */}
      <p style={{ marginBottom: "10px", color: "#b6c2cf" , fontSize:'14px',}}>
        Drag and drop files here or use the provided content below.
      </p>
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};

export default DragAndDropArea;
