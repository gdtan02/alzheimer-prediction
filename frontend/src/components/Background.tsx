import React from "react";

interface PageBackgroundProps {
    children: React.ReactNode;
}

const PageBackground: React.FC<PageBackgroundProps> = ({children}) => {
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center"
            style={{
                backgroundImage: `url("src/assets/health-and-wellness.jpg")`,
                position: "relative",
            }}
        >
            {/* Overlay to reduce brightness and contrast */}
            <div
                className="absolute inset-0 bg-black/40"
                style={{ backdropFilter: "blur(1px)" }}
            ></div>

            {/* Container */}
            <div className="relative z-10 min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default PageBackground;