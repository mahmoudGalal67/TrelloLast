import "./Workspaces.css";
import { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/navbar/Navbar";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SideBar from "../../components/sideBar/SideBar";
import Cookies from "js-cookie";
import Spinner from "react-bootstrap/Spinner";
import api from "../../apiAuth/auth";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Dropdown } from "react-bootstrap";
import PopupMsg from "../../components/popupmsg/PopupMsg";

import bgimg from "../../assets/pexels-anastasia-shuraeva-7278606.jpg";
import Notifications from "../../components/push notifications/PushNotifications";
import { AuthContext } from "../../components/context/Auth";

function Workspace() {
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [workSpaces, setworkSpaces] = useState([]);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedBoardName, setEditedBoardName] = useState("");
  const [editedBoardPhoto, setEditedBoardPhoto] = useState(null);
  const [editedvisibility, seteditedvisibility] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editedWorkspaceName, setEditedWorkspaceName] = useState("");
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const [wsMembers, setWsMembers] = useState({}); // تخزين الأعضاء بناءً على Workspace ID
  const [loadingWorkspaceId, setLoadingWorkspaceId] = useState(null); // ID الخاص بالـ Workspace الجاري تحميله

  const [openPopUp, setOpenPopUp] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const [boardVisibility, setBoardVisibility] = useState("workspace"); // Default value

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [initialBoardVisibility, setInitialBoardVisibility] =
    useState(boardVisibility);

  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const cookies = Cookies.get("token");

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const { data } = await api({
        url: "/workspaces/get-workspaces",
        headers: { Authorization: `Bearer ${cookies}` },
      });
      setworkSpaces(data.result);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [cookies]);

  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(userId)) {
        return prevSelectedUsers.filter((id) => id !== userId);
      } else {
        return [...prevSelectedUsers, userId];
      }
    });
  };

  const checkUserAccess = async (boardId, workspaceId) => {
    try {
      const { data } = await api({
        url: `boards/get-board/${boardId}`,
        headers: { Authorization: `Bearer ${cookies}` },
      });

      setHasAccess(true);
      navigate(`/board/${workspaceId}/${boardId}`); // إذا كان عضوًا، يتم التوجيه
    } catch (e) {
      console.error("Error getting board information", e);

      if (e.response && e.response.status === 403) {
        setHasAccess(false); // يمكن إيقاف الوصول هنا أيضًا إذا لزم الأمر
      } else {
        setHasAccess(false);
      }

      return false; // في حال حدوث خطأ، يُمنع الدخول
    }
  };

  const handleBoardClick = async (boardId, workspaceId) => {
    const hasAccess = await checkUserAccess(boardId, workspaceId); // انتظر التحقق من الصلاحيات
    if (hasAccess) {
      navigate(`/board/${workspaceId}/${boardId}`); // إذا كان عضوًا، يتم التوجيه
    }
  };

  const handleEditClick = (board_id, currentBoardName, currentBoardPhoto) => {
    setEditingBoardId(board_id);
    setEditedBoardName(currentBoardName);
    setEditedBoardPhoto(currentBoardPhoto);
    seteditedvisibility("public");
    setShowModal(true);
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
      } else {
        setError("Please select a valid image file.");
        setFile(null);
      }
    } else {
      setError("No photo selected.");
    }
  };

  useEffect(() => {
    setInitialBoardVisibility(boardVisibility);
  }, [boardVisibility]);

  const handleSaveClick = async (workspace_id, board_id, wsUsers) => {
    const formData = new FormData();
    formData.append("workspace_id", workspace_id);
    formData.append("name", editedBoardName || ""); // إذا لم يتم إدخال اسم جديد، ارسل الاسم الحالي
    formData.append("visibility", boardVisibility); // Ensure visibility is added

    if (boardVisibility !== initialBoardVisibility) {
      formData.append("visibility", boardVisibility);
    }

    // إرسال المستخدمين فقط إذا تم اختيارهم
    if (selectedUsers.length > 0) {
      formData.append("user_ids[]", selectedUsers); // إرسال الحقل كمصفوفة
    }
    // أضف الصورة فقط إذا تم اختيار صورة جديدة
    if (file) {
      formData.append("photo", file);
    }

    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // تحقق من الرؤية الخاصة والمستخدمين المحددين
    //  if (boardVisibility === "private" && selectedUsers.length === 0) {
    //    alert("Please select at least one user for private visibility.");
    //    return;
    //  }

    try {
      const response = await api({
        url: `/boards/update/${board_id}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      if (response.data.success) {
        console.log("Board updated successfully:", response.data.data);

        // تحديث البيانات في الحالة
        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces?.map((workspace) =>
            workspace.id === workspace_id
              ? {
                  ...workspace,
                  boards_of_the_workspace:
                    workspace.boards_of_the_workspace.map((board) =>
                      board.id === board_id
                        ? {
                            ...board,
                            name: editedBoardName || board.name,
                            photo: file ? file : board.photo, // إذا لم يتم تغيير الصورة، احتفظ بالصورة الأصلية
                          }
                        : board
                    ),
                }
              : workspace
          )
        );

        // إعادة تعيين الحقول
        setEditingBoardId(null);
        setEditedBoardName("");
        setEditedBoardPhoto(null);
        setShowModal(false);
      } else {
        console.error("Update failed:", response.data.message);
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error(
        "Error updating board:",
        error.response?.data || error.message
      );

      alert("Failed to update board. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditedBoardName("");
    setEditedBoardPhoto(null);
    setShowModal(false);
  };

  const handleDeleteClick = async (workspace_id, board_id) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        await api({
          url: `/boards/destroy/${board_id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });

        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces.map((workspace) =>
            workspace.id === workspace_id
              ? {
                  ...workspace,
                  boards_of_the_workspace:
                    workspace.boards_of_the_workspace.filter(
                      (board) => board.id !== board_id
                    ),
                }
              : workspace
          )
        );
      } catch (error) {
        console.log("Error deleting board:", error);
      }
    }
  };

  // edit and delete workspace

  const handleSaveWorkspaceClick = async () => {
    try {
      const response = await api({
        url: `/workspaces/update`,
        method: "POST",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { workspace_id: editingWorkspaceId, name: editedWorkspaceName },
      });

      setworkSpaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) =>
          workspace.id === editingWorkspaceId
            ? { ...workspace, name: editedWorkspaceName }
            : workspace
        )
      );

      setEditingWorkspaceId(null);
      setEditedWorkspaceName("");
      setShowWorkspaceModal(false);
    } catch (error) {
      console.log("Error updating workspace name:", error);
    }
  };

  const handleEditWorkspaceClick = (workspace_id, currentWorkspaceName) => {
    setEditingWorkspaceId(workspace_id);
    setEditedWorkspaceName(currentWorkspaceName);
    setShowWorkspaceModal(true);
  };

  const handleDeleteWorkspaceClick = async (workspace_id) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      try {
        await api({
          url: `/workspaces/destroy/${workspace_id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });

        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces.filter((workspace) => workspace.id !== workspace_id)
        );
      } catch (error) {
        console.log("Error deleting workspace:", error);
      }
    }
  };

  const getWorkspaceMembers = async (workspaceId) => {
    // إذا كانت البيانات موجودة بالفعل، لا تقم بجلبها مجددًا
    if (wsMembers[workspaceId]) setLoadingWorkspaceId(workspaceId); // تعيين ID الجاري تحميله
    try {
      const response = await api({
        url: `/workspaces/${workspaceId}/users`,
        method: "GET",
        headers: { Authorization: `Bearer ${cookies}` },
      });

      const members = Array.isArray(response.data.result)
        ? response.data.result
        : [];

      // تحديث الأعضاء مع ربطهم بـ workspaceId
      setWsMembers((prev) => ({
        ...prev,
        [workspaceId]: members,
      }));
      // }, 100);
      // تحديث الأعضاء مع ربطهم بـ workspaceId
    } catch (error) {
      console.error("Error getting workspace members:", error);
      // حفظ ID مع بيانات فارغة في حال الخطأ
      setWsMembers((prev) => ({
        ...prev,
        [workspaceId]: [],
      }));
    } finally {
      setLoadingWorkspaceId(null); // إنهاء التحميل
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (!show) {
      document.querySelector(".views")?.classList.add("large");
    } else {
      document.querySelector(".views")?.classList.remove("large");
    }
  }, [show]);

  const renderUsersForWorkspace = () => {
    // Find the related workspace based on the current board ID
    const relatedWorkspace = workSpaces.find((workspace) =>
      workspace.boards_of_the_workspace.some(
        (board) => board.id === editingBoardId
      )
    );

    if (
      !relatedWorkspace ||
      !relatedWorkspace.users ||
      relatedWorkspace.users.length === 0
    ) {
      return <p>No users found for this workspace.</p>;
    }

    return relatedWorkspace.users.map((user) => {
      // Check if the user is already assigned to the current board
      const board = relatedWorkspace.boards_of_the_workspace.find(
        (board) => board.id === editingBoardId
      );

      const isUserInBoard =
        board && board.users
          ? board.users.some((boardUser) => boardUser.user_id === user.user_id)
          : false;

      return (
        <Form.Check
          key={user.user_id}
          type="checkbox"
          label={user.user_name}
          value={user.user_id}
          checked={isUserInBoard || selectedUsers.includes(user.user_id)}
          onChange={(e) => handleUserSelection(Number(e.target.value))}
          style={{
            width: "30%",
            display: "flex",
            gap: "6px",
            fontSize: "14px",
            alignItems: "center",
          }}
        />
      );
    });
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
    <div className="home">
      <Navbar
        workSpaces={workSpaces}
        setShow={setShow}
        setworkSpaces={setworkSpaces}
        allUsers={allUsers}
        setAllUsers={setAllUsers}
      />

      <SideBar show={show} setShow={setShow} />

      {hasAccess === false && (
        <Alert
          variant="danger"
          style={{
            position: "fixed",
            top: "100px",
            left: "50%",
            // width: "30%",
            zIndex: "11111",
            transform: "translate(-50%, -50%)",
          }}
          onClose={() => setHasAccess(true)} // إغلاق التنبيه عند الضغط على زر الإغلاق
          dismissible
        >
          Please contact the administrator to access the board.
        </Alert>
      )}

      <div
        className="views"
        style={{
          minHeight: "100vh",
          width: show ? "calc(100% - 280px)" : "100%",
          marginLeft: show ? "280px" : "0",
        }}
      >
        <h3 className="ms-2">YOUR WORKSPACES</h3>
        <div className="workSpacesContainer">
          {workSpaces.map((workspace) => (
            <div className="workspace-item" key={workspace.id}>
              {" "}
              {/* single workspace */}
              <div className="d-flex flex-wrap justify-content-around mb-5">
                <div>
                  <h3>{workspace.name}</h3>
                </div>
                <div className="workspace-bar">
                  <NavLink
                    to={`/workspace/${workspace.id}`}
                    className="ws-option"
                  >
                    Boards
                  </NavLink>

                  <Dropdown
                    key={workspace.id}
                    onClick={() => {
                      getWorkspaceMembers(workspace.id);
                    }}
                  >
                    <Dropdown.Toggle
                      id={`dropdown-${workspace.id}`}
                      className="ws-option"
                    >
                      Members
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="membersMenu">
                      {loadingWorkspaceId === workspace.id ? (
                        <Dropdown.Item>Loading members...</Dropdown.Item> // إذا كانت البيانات لا تزال قيد التحميل
                      ) : wsMembers[workspace.id] &&
                        wsMembers[workspace.id]?.length > 0 ? (
                        // إذا كان هناك أعضاء
                        wsMembers[workspace.id].map((member) => (
                          <Dropdown.Item
                            key={member.user_id}
                            className="custom-dropdown-item"
                          >
                            {member.user_name}
                          </Dropdown.Item>
                        ))
                      ) : (
                        // إذا لم يكن هناك أعضاء
                        <Dropdown.Item>No members found</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                  {user.role === "admin" && (
                    <>
                      <button
                        className="ws-option"
                        onClick={() =>
                          handleEditWorkspaceClick(workspace.id, workspace.name)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="ws-option"
                        onClick={() => handleDeleteWorkspaceClick(workspace.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="wrapper views-wrapper">
                {workspace.boards_of_the_workspace.map((board) => {
                  // console.log("ws: ", workspace);
                  return (
                    <div className="board-container" key={board.id}>
                      <div
                        className="card"
                        style={{
                          backgroundImage:
                            board.photo instanceof File
                              ? `url(${URL.createObjectURL(board.photo)})`
                              : board.photo
                              ? `url(https://back.alyoumsa.com/public/storage/${board.photo})`
                              : `url(${bgimg})`,
                        }}
                      >
                        <div
                          className="board-link"
                          // to={`board/${workspace.id}/${board.id}`}
                          onClick={() => {
                            handleBoardClick(board.id, workspace.id);
                          }}
                        >
                          <div className="card-content">
                            <p className="board-name">{board.name}</p>
                          </div>
                        </div>
                        <Dropdown>
                          <Dropdown.Toggle
                            as="button"
                            drop="down"
                            className="custom-dropdown-toggle p-0 no-caret"
                          >
                            <span
                              className="vertical-dots"
                              style={{ color: "white" }}
                            >
                              ⋮
                            </span>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() =>
                                handleEditClick(
                                  board.id,
                                  board.name,
                                  board.photo
                                )
                              }
                            >
                              <i className="fa-regular fa-pen-to-square me-2"></i>{" "}
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleDeleteClick(workspace.id, board.id)
                              }
                              className="text-danger"
                            >
                              <i className="fa-regular fa-trash-can me-2"></i>{" "}
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal show={showModal} onHide={handleCancelEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Board</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            width: "100%",
            overflow: "hidden",
            padding: "20px 30px ",
          }}
        >
          <Form.Group controlId="formBoardName">
            <Form.Label>Board Name</Form.Label>
            <Form.Control
              type="text"
              value={editedBoardName}
              onChange={(e) => setEditedBoardName(e.target.value)}
              placeholder="Enter new board name"
            />
          </Form.Group>
          <Form.Group controlId="formBoardPhoto">
            <Form.Label>Board Photo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Form.Group>
          <Form.Group controlId="formBoardVisibility">
            <Form.Label>Visibility</Form.Label>
            <Form.Select
              value={boardVisibility} // State holding the selected visibility
              onChange={(e) => setBoardVisibility(e.target.value)} // Update state on change
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="workspace">workspace</option>
            </Form.Select>
          </Form.Group>
          {/* Conditional Rendering for Private Visibility */}
          {/* {boardVisibility === "private" && (
            <Form.Group controlId="formWorkspaceUsers">
              <Form.Label>Select Users</Form.Label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "start",
                  gap: "10px",
                  alignItems: "center",
                  padding: "16px 10px",
                  paddingTop: "05px",
                }}
              >
                {(() => {
                  // إيجاد الـ workspace المرتبط باللوحة الحالية
                  const relatedWorkspace = workSpaces.find((workspace) =>
                    workspace.boards_of_the_workspace.some(
                      (board) => board.id === editingBoardId
                    )
                  );

                  if (
                    relatedWorkspace &&
                    relatedWorkspace.users &&
                    relatedWorkspace.users.length > 0
                  ) {
                    console.log(relatedWorkspace.users);
                    // عرض المستخدمين إذا تم العثور على أعضاء
                    return relatedWorkspace.users.map((user) => {
                      // تحقق مما إذا كان المستخدم في البورد الحالي
                      const board =
                        relatedWorkspace.boards_of_the_workspace.find(
                          (board) => board.id === editingBoardId
                        );

                      // تحقق إذا كانت الخاصية users موجودة في البورد قبل استخدام `some`
                      const isUserInBoard =
                        board && board.users
                          ? board.users.some(
                              (boardUser) => boardUser.user_id === user.user_id
                            )
                          : false;

                      return (
                        <Form.Check
                          key={user.user_id}
                          type="checkbox"
                          label={user.user_name}
                          value={user.user_id}
                          checked={
                            isUserInBoard ||
                            selectedUsers.includes(user.user_id)
                          }
                          onChange={(e) =>
                            handleUserSelection(Number(e.target.value))
                          } // تحديث حالة التحديد
                          style={{
                            width: "30%",
                            display: "flex",
                            gap: "6px",
                            fontSize: "14px",
                            alignItems: "center",
                          }}
                        />
                      );
                    });
                  } else {
                    return <p>No users found for this workspace.</p>;
                  }
                })()}
              </div>
            </Form.Group>
          )} */}
          {boardVisibility === "private" && (
            <Form.Group controlId="formWorkspaceUsers">
              <Form.Label>Select Users</Form.Label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "start",
                  gap: "10px",
                  alignItems: "center",
                  padding: "16px 10px",
                  paddingTop: "05px",
                }}
              >
                {renderUsersForWorkspace()}
              </div>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={(e) => {
              e.preventDefault();
              const workspace = workSpaces.find((ws) =>
                ws.boards_of_the_workspace.some((b) => b.id === editingBoardId)
              );

              if (!workspace || !editedBoardName) {
                alert("Please make sure to fill all required fields.");
                return;
              }

              handleSaveClick(workspace.id, editingBoardId, selectedUsers);
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showWorkspaceModal}
        onHide={() => setShowWorkspaceModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Workspace Name</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            overflow: "hidden",
            width: "100%",
            padding: "20px",
          }}
        >
          <Form.Group
            controlId="formWorkspaceName"
            style={{
              overflow: "hidden",
              width: "100%",
              display: "flex",
              gap: "20px",
              flexDirection: "column",
            }}
          >
            <Form.Label>Workspace Name</Form.Label>
            <Form.Control
              type="text"
              value={editedWorkspaceName}
              onChange={(e) => setEditedWorkspaceName(e.target.value)}
              placeholder="Enter new workspace name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowWorkspaceModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveWorkspaceClick}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <button
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          backgroundColor: "#b6c2cf",
          color: "#1c2b41",
          borderRadius: "50%",
          cursor: "pointer",
          width: "50px",
          height: "50px",
          fontWeight: "bold",
          border: "none",
        }}
        onClick={() => {
          setOpenPopUp(!openPopUp);
        }}
      >
        msg
      </button>
      {openPopUp && <PopupMsg workSpaces={workSpaces} allUsers={allUsers} />}
    </div>
  );
}

export default Workspace;
