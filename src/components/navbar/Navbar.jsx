import { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Cookies from "js-cookie";
import api from "../../apiAuth/auth";
import { AuthContext } from "../context/Auth";
import "./navbar.css";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";
import ChangeBoardBg from "../changeBoardBg/ChangeBoardBg";
import { DropdownButton } from "react-bootstrap";

function NavBar({
  workSpaces,
  setShow,
  setworkSpaces,
  disableAdding,
  currWSUsers,
  allUsers,
  board,
}) {
  const [error, setError] = useState(null);
  const [alluser, setAllUsers] = useState([]);
  const { user, dispatch } = useContext(AuthContext);
  const workspaceTitle = useRef(null);
  const boardTitle = useRef(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [shouldFetchAssignedUsers, setShouldFetchAssignedUsers] =
    useState(false);

  const [showBGBoard, setShowBg] = useState(true);
  const [visibility, setVisibility] = useState("workspace");
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [image, setImage] = useState(null);

  const [recentViewed, setRecentViewed] = useState([]);

  const navigate = useNavigate();

  const location = useLocation();

  const path = location.pathname;
  const pathName = path.split("/")[1];
  const cookies = Cookies.get("token");
  const { workspaceId, boardId } = useParams();

  useEffect(() => {
    if (path === `/board/${workspaceId}/${boardId}`) {
      // قراءة البيانات من localStorage
      const storedRecentViewed =
        JSON.parse(localStorage.getItem("recentViewed")) || [];

      // تحديث recentViewed بإضافة البورد الحالي
      setRecentViewed((prevRecentViewed) => {
        // إنشاء كائن البورد الجديد
        const currentBoard = {
          id: board.id,
          name: board.name,
          wsId: workspaceId,
          // photo: board.photo || null
        };

        // التحقق من عدم وجود البورد مسبقًا في القائمة
        const boardExists = storedRecentViewed.some(
          (storedBoard) =>
            storedBoard.id === currentBoard.id &&
            storedBoard.wsId === currentBoard.wsId
        );

        if (!boardExists) {
          // دمج البورد الجديد مع القيم القديمة والاحتفاظ بآخر 3 بوردات
          const updatedRecentViewed = [
            currentBoard,
            ...storedRecentViewed,
          ].slice(0, 3);

          // تحديث localStorage
          localStorage.setItem(
            "recentViewed",
            JSON.stringify(updatedRecentViewed)
          );

          return updatedRecentViewed;
        }

        // إذا كان البورد موجودًا بالفعل، أرجع القيم الحالية
        return storedRecentViewed;
      });
    } else if (pathName !== "board") {
      // قراءة recentViewed من localStorage إذا لم تكن في صفحة بورد
      const storedRecentViewed =
        JSON.parse(localStorage.getItem("recentViewed")) || [];
      setRecentViewed(storedRecentViewed);
    }
  }, [boardId]);

  // const handleChange = (event) => {
  //   const options = Array.from(
  //     event.target.selectedOptions,
  //     (option) => option.value
  //   );
  //   setSelectedOptions(options);
  //   console.log(options);
  // };
  const handleImageChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users/get-users", {
        headers: { Authorization: `Bearer ${cookies}` },
      });
      setAllUsers(data.data); // Ensure 'data.data' matches your API structure
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cookies) {
      fetchUsers();
    }
  }, [cookies]);

  const addBoard = async (e) => {
    e.preventDefault();
    setError(null); // إعادة تعيين الخطأ
    setLoading(true);
    let boardData = {}; // إعداد كائن البيانات

    try {
      // استخدم الصورة المختارة مباشرة إذا كانت موجودة
      // إعداد البيانات المرسلة
      boardData = {
        name: boardTitle.current.value,
        workspace_id: workspaceId,
        visibility: visibility,
        user_ids: visibility === "private" ? selectedUsersIds : [],
        photo: image,
      };

      // إرسال الطلب لإنشاء الـ Board
      const { data } = await api({
        url: "/boards/create",
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "multipart/form-data",
        },
        data: boardData,
      });
      setLoading(false);

      navigate(`/board/${workspaceId}/${data.data.id}`);
      setError(null); // إعادة تعيين الخطأ إذا تمت العملية بنجاح
    } catch (err) {
      console.error("Error occurred:", err);
      setLoading(false);

      // طباعة معلومات الخطأ
      console.log("Failed data:", {
        boardData: Object.keys(boardData).length ? boardData : "Data not set",
      });

      if (err.response) {
        // إذا كانت هناك استجابة من الخادم
        console.error("Error from server:", err.response.data);
        setError(
          err.response.data.message ||
            "An error occurred while creating the board."
        );
      } else if (err.request) {
        // إذا لم يتم تلقي استجابة
        setError(
          "No response from server. Please check your network connection."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const addWorkspace = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api({
        url: "/workspaces/create",
        method: "post",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { name: workspaceTitle.current.value },
      });
      setworkSpaces((prev) => [...prev, data.result]);
      document.querySelector(".create .dropdown-menu").classList.remove("show");
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message);
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const { data } = await api.get(`/boards/get-board/${boardId}`, {
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setAssignedUsers(data.data.users);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message);
      }
    };

    if (boardId) {
      fetchAssignedUsers();
      setShouldFetchAssignedUsers(false);
    }
  }, [cookies, boardId, shouldFetchAssignedUsers]);

  const handleUserClick = async (userId) => {
    const isAssigned = assignedUsers.some((user) => user.user_id === userId);
    try {
      if (isAssigned) {
        if (
          confirm("user already exist in the board do you want to delete it")
        ) {
          await api.post(
            "/boards/remove-user-from-board",
            {
              board_id: boardId,
              user_id: userId,
            },
            {
              headers: { Authorization: `Bearer ${cookies}` },
            }
          );
          setAssignedUsers(assignedUsers.filter((user) => user.id !== userId));
          alert("User successfully removed from the board!");
        }
      } else {
        await api.post(
          "/boards/assign-user-to-board",
          {
            board_id: boardId,
            user_id: [userId],
          },
          {
            headers: { Authorization: `Bearer ${cookies}` },
          }
        );
        setAssignedUsers([
          ...assignedUsers,
          allUsers.find((user) => user.id === userId),
        ]);
        alert("User successfully assigned to the board!");
      }

      setShouldFetchAssignedUsers(true);
    } catch (err) {
      console.error("API error:", err);

      const responseMessage =
        err.response?.data?.message || "An unexpected error occurred";
      console.error("Detailed error response:", err.response);

      if (err.response?.status === 422) {
        setError(`Validation Error: ${responseMessage}`);
      } else if (err.response?.status === 400) {
        setError(`Bad Request: ${responseMessage}`);
      } else {
        setError(responseMessage);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.post(
        "/logout",
        {},
        {
          headers: { Authorization: `Bearer ${cookies}` },
        }
      );
      Cookies.remove("token");
      dispatch({ type: "logout" });

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err.message || "Unknown error");
      setError(err.response?.data?.message || "Failed to log out.");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/logo.gif"
            style={{
              width: "80px",
              height: "30px",
              objectFit: "contain",
              borderRadius: "5px",
            }}
            alt=""
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />

        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            {pathName === "" ? (
              <NavDropdown
                title="Workspaces"
                id="navbarScrollingDropdown"
                className="workspacesMenu"
              >
                {workSpaces?.length > 0 ? (
                  workSpaces?.map((workspace) => (
                    <NavDropdown.Item
                      key={workspace.id}
                      as={Link}
                      to={`/workspace/${workspace.id}`}
                      style={{
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#e774bb",
                          width: "24px",
                          height: "24px",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "14px",
                          color: "#1d2125",
                          fontWeight: "bold",
                        }}
                      >
                        {workspace.name.charAt(0).toUpperCase()}
                      </span>
                      {workspace.name}
                    </NavDropdown.Item>
                  ))
                ) : (
                  <NavDropdown.Item>No workspace available</NavDropdown.Item>
                )}
              </NavDropdown>
            ) : (
              ""
            )}

            {pathName === "board" && (
              <NavDropdown
                title="Invite Board Members"
                id="navbarScrollingDropdown"
              >
                {alluser &&
                  alluser.length > 0 &&
                  alluser.map((user) => (
                    <NavDropdown.Item
                      key={user.id}
                      onClick={() => handleUserClick(user.id)}
                    >
                      {user.email}
                    </NavDropdown.Item>
                  ))}
              </NavDropdown>
            )}

            {user?.role === "admin" &&
            pathName === "" &&
            pathName !== "board" &&
            pathName !== "workspace" &&
            !disableAdding ? (
              <NavDropdown
                title="Create Workspace"
                id="navbarScrollingDropdown"
                className="create"
              >
                <form className="container" onSubmit={addWorkspace}>
                  <h2>Workspace</h2>
                  <div className="input-wrapper">
                    <label htmlFor="">Workspace title *</label>
                    <input
                      ref={workspaceTitle}
                      type="text"
                      required
                      autoFocus
                    />
                  </div>
                  <Button type="submit" variant="primary">
                    Create Workspace
                  </Button>
                  {error && (
                    <span
                      className="err"
                      style={{
                        backgroundColor: "#ffc5c9",
                        color: "#212529",
                        padding: "8px",
                        fontWeight: "500",
                        fontSize: "12px",
                        borderRadius: "5px",
                        marginBottom: "8px",
                      }}
                    >
                      {error}
                    </span>
                  )}
                </form>
              </NavDropdown>
            ) : (
              !disableAdding &&
              pathName !== "" && (
                <NavDropdown
                  title="Create Board"
                  id="navbarScrollingDropdown"
                  className="create"
                  onClick={() => setShow(false)}
                >
                  <form
                    className="container"
                    onSubmit={addBoard}
                    style={{
                      width: "300px",
                      maxHeight: "85vh",
                      overflow: "auto",
                    }}
                  >
                    <h2>Board</h2>
                    <div
                      className="input-wrapper"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "16px",
                        width: "100%",
                      }}
                    >
                      {/* <label htmlFor="">Board title</label> */}
                      <input
                        ref={boardTitle}
                        type="text"
                        required
                        autoFocus
                        placeholder="title"
                        style={{ width: "100%", padding: "4px 10px" }}
                      />
                      <Form.Select
                        aria-label="Default select example"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                      >
                        <option value="public">public</option>
                        <option value="private">private</option>
                        <option value="workspace">workspace</option>
                      </Form.Select>
                      {visibility === "private" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            justifyContent: "space-between",
                            // marginBottom: "8px",
                            flexWrap: "wrap",
                            boxShadow: "0 0 3px 1px #555",
                            padding: "10px",
                            margin: "16px 0",
                          }}
                        >
                          {currWSUsers &&
                            currWSUsers?.length > 0 &&
                            currWSUsers?.map((user) => (
                              <div
                                key={user.user_id}
                                style={{
                                  width: "45%",
                                  fontSize: "12px",
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    value={user.user_id}
                                    onChange={(e) => {
                                      setSelectedUsersIds((prevSelected) => {
                                        if (e.target.checked) {
                                          return [
                                            ...prevSelected,
                                            user.user_id,
                                          ];
                                        } else {
                                          return prevSelected.filter(
                                            (id) => id !== user.user_id
                                          );
                                        }
                                      });
                                    }}
                                  />
                                  {user.user_name}
                                </label>
                              </div>
                            ))}
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleImageChange} // يتم رفع الصورة عند اختيارها
                      />
                      {image && (
                        <img
                          src={URL.createObjectURL(image)}
                          width="100%"
                          htmlFor="file"
                          height="160px"
                        />
                      )}
                      <label style={{ cursor: "pointer" }} htmlFor="file">
                        Choose Background Picture
                      </label>

                      {/* <div>
                        <h4>Choose a Picture</h4>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {[pic1, pic2, pic3, pic4].map((pic, index) => (
                            <img
                              key={index}
                              src={pic}
                              alt={`pic${index + 1}`}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "5px",
                                margin: "5px",
                                cursor: "pointer",
                                border:
                                  image === pic
                                    ? "2px solid blue"
                                    : "2px solid transparent",
                              }}
                              onClick={() => setImage(pic)}
                            />
                          ))}
                        </div>
                      </div> */}
                    </div>
                    <Button
                      type="submit"
                      className="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? "Loading ..." : "Create Board"}
                    </Button>
                    {/* {error && (
                      <span
                        className="err"
                        style={{
                          backgroundColor: "#ffc5c9",
                          color: "#212529",
                          padding: "8px",
                          fontWeight: "500",
                          fontSize: "12px",
                          borderRadius: "5px",
                          marginBottom: "8px",
                        }}
                      >
                        {error}
                      </span>
                    )} */}
                  </form>
                </NavDropdown>
              )
            )}

            <NavDropdown
              title="Recent"
              id="nav-dropdown"
              className="create workspacesMenu"
            >
              {recentViewed?.length > 0 ? (
                recentViewed.map((recent, index) => (
                  <NavDropdown.Item
                    as="li"
                    key={index}
                    style={{
                      paddingLeft: "15px",
                      marginBottom: "5px",
                      // backgroundColor: "#282e33",
                    }}
                  >
                    {recent.name}
                  </NavDropdown.Item>
                ))
              ) : (
                <NavDropdown.Item as="li">No Recent Boards</NavDropdown.Item>
              )}
            </NavDropdown>
          </Nav>

          <Form className="d-flex justify-content-center">
            <form
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            >
              <input
                placeholder="Search"
                aria-label="Search"
                type="search"
                className="me-2 form-control"
                onClick={(e) => {
                  e.target.focus();
                }}
                autoFocus
              ></input>
            </form>
            {user ? (
              <Dropdown align="end" style={{ borderRadius: "50%" }}>
                <Dropdown.Toggle
                  className="user-name no-caret"
                  id="dropdown-basic"
                >
                  {user.name.split(" ")[0].charAt(0).toUpperCase()}
                  {"."}
                  {user.name.split(" ")[1]?.charAt(0)?.toUpperCase()}
                </Dropdown.Toggle>

                <Dropdown.Menu className="log-GD">
                  <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowBg(!showBGBoard)}>
                    change board bg
                  </Dropdown.Item>
                  {showBGBoard && <ChangeBoardBg />}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login">
                <img
                  src="/avatar.jpg"
                  alt=""
                  style={{ width: "40px", height: "40px" }}
                />
              </Link>
            )}
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
