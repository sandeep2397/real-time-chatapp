import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
// import "emoji-mart/css/emoji-mart.css";

interface props {
  onSend: any;
}
const CustomInput = ({ onSend }: props) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      onSend({ type: "file", files: acceptedFiles });
    },
  });

  const addEmoji = (emoji: any) => {
    setText((prevText) => prevText + emoji.native);
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend({ type: "text", content: text });
      setText("");
    }
  };

  const handleEmojiClick = (event: any, emojiObject: any) => {
    // Handle emoji click
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
      <div
        {...getRootProps()}
        style={{
          border: "1px dashed #ccc",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        Drag 'n' drop files here, or click to select files
      </div>
      <button onClick={handleSend}>Send</button>

      {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    </div>
  );
};

export default CustomInput;
