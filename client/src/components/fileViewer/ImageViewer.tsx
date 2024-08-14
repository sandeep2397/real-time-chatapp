import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Worker } from "@react-pdf-viewer/core";
import { Document, Page, pdfjs } from "react-pdf";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface props {
  open: boolean;
  handleOpen: any;
  handleClose: any;
  fileType: string;
  fileUrl: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ImageViewer: React.FC<props> = ({
  open,
  fileType,
  fileUrl,
  handleOpen,
  handleClose,
}: props) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="doc-viewer"
        maxWidth="md"
        fullWidth={true}

        // style={{
        //   height: "400px",
        //   width: "1000px",
        // }}
      >
        <DialogTitle>{"Image Viewer"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <div style={{ width: "600px", height: "350px" }}>
              {" "}
              <img
                src={fileUrl}
                height="100%"
                width={"100%"}
                alt="Image"
                style={{ padding: "8px" }}
              />{" "}
              {/* <iframe
                src={fileUrl}
                width="100%"
                height="600px"
                frameBorder="0"
                title="Image-Video Viewer"
              /> */}
            </div>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default ImageViewer;
