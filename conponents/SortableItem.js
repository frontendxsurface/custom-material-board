import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Children } from "react";

export function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    // width: "200px",
    // height: "100px",
    background: "#e9e7e7",
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    borderRadius: "6px",
    marginBottom: "8px",
    cursor: "pointer",
    padding: "4px",
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img
        src={
          props.data.img
            ? props.data.img
            : "https://cdn.vectorstock.com/i/preview-1x/48/06/image-preview-icon-picture-placeholder-vector-31284806.jpg"
        }
        style={{
          width: "50px",
          height: "50px",
          objectFit: "cover",
          objectPosition: "center",
          borderRadius: "8px",
        }}
      />
      {props.children}
    </div>
  );
}
