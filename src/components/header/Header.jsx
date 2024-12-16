import React, { useState } from 'react'
import './header.css';
import ProfileCard from '../profileCard/ProfileCard';

const BoardHeader = ({boardName, showSideBar}) => {
  
  return (
    <header
      className="boardHeader"
      style={{
        width: showSideBar ? "calc(100% - 280px)" : "calc(100% - 15px)",
        left: showSideBar ? '280px' : "15px",
        position: 'fixed',
top: '60px',
      }}
    >
      <div className="headerContainer">
        <h5 className="boardName ps-5 m-0 ">{boardName}</h5>
        <span>
          <div>
            <ProfileCard />
          </div>
        </span>
      </div>
    </header>
  );
}

export default BoardHeader;
