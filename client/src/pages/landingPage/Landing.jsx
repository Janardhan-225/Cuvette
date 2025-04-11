import React from "react";
import "../landingPage/landingPage.css";
import main from "../../assets/images/main.png";
import { Wrapper } from "./landing.styles";
import { Logo } from "../../components/index";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <Wrapper>
      <nav className="navbar  ">
        <Logo />
      </nav>

      <div className="container page">
        {" "}
        <div className="info">
          <h1>
            Student Job <span>tracking</span> app
          </h1>
          <p>Track Your Job Search Process Now!</p>
          <Link to="/register" className="btn btn-hero">
            Login/Register
          </Link>
        </div>
        <div 
  className="position-relative overflow-hidden rounded-4 shadow-lg hover-shadow-xl transition-all"
  style={{
    backgroundImage: `url(${main})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%",
    minHeight: "300px",
    aspectRatio: "16/9",
    cursor: "pointer",
  }}
>
        <img src={main} alt="job hunt" className="img main-img" />
        </div>
      </div>
    </Wrapper>
  );
};

export default Landing;
