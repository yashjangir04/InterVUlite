import React from "react";
import { FaRegCopyright } from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div>
      <div
        className="h-[5vh] bg-transparent absolute bottom-0 left-0 w-full flex items-center justify-center"
        role="contentinfo"
        aria-label="Footer section"
      >
        <div
          className="flex flex-row items-center gap-2"
          aria-label="Copyright information"
        >
          <h1
            className="text-zinc-500 text-sm mt-1"
            aria-label="Copyright symbol"
          >
            <FaRegCopyright />
          </h1>
          <h1
            className="text-zinc-500 text-sm"
            aria-label={`© ${year} InterVU by Yash Jangir. All rights reserved.`}
          >
            {year} InterVU - Yash Jangir. All rights reserved.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Footer;
