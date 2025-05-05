import React from "react";
import MixedUpload from "./MixedUpload";
import SingleFileUpload from "./SingleFileUpload";
import MultiFileUpload from "./MultipleFileUpload";

function Uploads() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Upload Profile Picture</h2>
      <SingleFileUpload />

      <hr />

      <h2>Upload Documents</h2>
      <MultiFileUpload />

      <hr />
      <h2>Upload Mixed (Image + PDF)</h2>
      <MixedUpload />
    </div>
  );
}

export default Uploads;
