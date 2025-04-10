import React from 'react';
import './HeroSection.css';

const HeroSection = () => (
  <section id="hero" className="hero">
    <div className="overlay">
      <h1>
        <span className="line">Rewriting the</span>
        <span className="line">way you learn</span>
        <span className="line"><span className="highlight">with AI</span></span>
      </h1>
      <p>
        Our AI-powered platform turns lecture recordings into clear, structured notes with summaries, visuals, and easy exports like PDF or DOCX. Whether you're a student catching up or an educator sharing content, we make it simple. With features like Last-Minute Notes for quick revision, you can focus on learning or teaching — while we handle the rest.
      </p>
      <button className="try-service-btn">Try Service</button>
    </div>
  </section>
);

export default HeroSection;
