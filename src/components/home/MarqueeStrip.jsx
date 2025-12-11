import React from "react";
import "../../css/marque.css";

const MarqueStrip= () => {
    return (
        <div className="marquee-box">
            {/* Track #1 */}
            <div className="marquee-track">
                <span className="bold-text">&nbsp Limited Time Offer – Premium Products at Best Prices! </span>
                <span className="outline-text"> 🚀⭐ New Collection Out Now! </span>

                <span className="bold-text"> 🎉 Shop Today & Save Big! </span>
                <span className="outline-text"> 💥 Exclusive Deals Only on Our Store! </span>
            </div>

            {/* Track #2 (duplicate for seamless infinite loop) */}
            <div className="marquee-track">
                <span className="bold-text"> Limited Time Offer – Premium Products at Best Prices! </span>
                <span className="outline-text"> 🚀⭐ New Collection Out Now! </span>

                <span className="bold-text"> 🎉 Shop Today & Save Big! </span>
                <span className="outline-text"> 💥 Exclusive Deals Only on Our Store! </span>
            </div>
        </div>
    );
};

export default MarqueStrip;
