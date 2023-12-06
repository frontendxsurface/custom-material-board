import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import html2canvas from "html2canvas";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

const ConfigDiv = styled.div`
  max-width: 20%;
  width: 20%;
  padding: 0 15px;
  background-color: #f5f5f5;
  box-shadow: 1px 1px 4px 2px rgb(0, 0, 0, 0.2);
  border-radius: 12px;
`;
const BoardDiv = styled.div`
  background: #fff;
  border: 1px solid gray;
  border-radius: 12px;
`;
const OrderDiv = styled.div`
  max-width: 20%;
  width: 20%;
  background-color: #f5f5f5;
  border-radius: 12px;
  box-shadow: 1px 1px 4px 2px rgb(0, 0, 0, 0.2);
  padding: 0 15px;
`;

const MaterialBoard = () => {
  const [image, setImage] = useState(null);
  const [material, setMaterial] = useState([
    {
      id: 1,
      x: 380,
      y: 35,
      width: 185,
      height: 176,
      img: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkf6wc2D5Nihp1_UbGzFA-aNs3Mx-H4ycRUM1Q5vfk4VVLz-jYsr1IEJu5hKlAtYCSukY&usqp=CAU`,
      type: "square",
    },
    {
      id: 2,
      x: 500,
      y: 126,
      width: 185,
      height: 176,
      type: "square",
      img: `https://t4.ftcdn.net/jpg/05/62/99/31/360_F_562993122_e7pGkeY8yMfXJcRmclsoIjtOoVDDgIlh.jpg`,
    },
    {
      id: 3,
      x: 625,
      y: 246,
      width: 185,
      height: 176,
      type: "round",
      img: `https://t3.ftcdn.net/jpg/05/65/73/56/360_F_565735615_D2uX6alZuUOu77bJkfh5JKJbKmyZmxNu.jpg`,
    },
  ]);
  const [currentMaterialData, setCurrentMaterialData] = useState({});
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleMaterialChange = (e) => {
    let value = parseInt(e.target.value) || 0;

    setCurrentMaterialData((prevData) => {
      const updatedData = {
        ...prevData,
        [e.target.name]:
          e.target.name === "width" || e.target.name === "height"
            ? Math.max(value, 0)
            : value,
      };

      console.log(updatedData); // Add this line for debugging

      return updatedData;
    });
  };
  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setMaterial((material) => {
        const oldIndex = material.map((e) => e.id).indexOf(active.id);
        const newIndex = material.map((e) => e.id).indexOf(over.id);

        return arrayMove(material, oldIndex, newIndex);
      });
      setSelectedMaterialIndex(null);
    }
  }

  const handleImageClick = () => {
    setMaterial([
      ...material,
      {
        id: Math.max(...material.map((data) => data.id)) + 1,
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        type: "square",
        img: ``,
      },
    ]);
    setCurrentMaterialData({});
    setSelectedMaterialIndex(null);
  };

  const handleDeleteMaterial = (index) => {
    if (selectedMaterialIndex == null) return;
    const newMaterialDataList = [...material];
    newMaterialDataList.splice(index, 1);
    setMaterial(newMaterialDataList);
    setSelectedMaterialIndex(null);
  };

  const handleMouseDown = (e, index) => {
    if (e.target.tagName === "DIV") {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setSelectedMaterialIndex(index);
      setCurrentMaterialData({ ...material[index] });
    }
  };

  const handleMouseMove = (e) => {
    if (isResizing && selectedMaterialIndex !== null && resizeHandle) {
      const { x, y, width, height } = currentMaterialData;
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setMaterial((prevMaterialDataList) => {
        const updatedMaterialDataList = prevMaterialDataList.map(
          (mat, index) => {
            if (index === selectedMaterialIndex) {
              return {
                ...mat,
                x: resizeHandle.includes("left") ? x + deltaX : mat.x,
                y: resizeHandle.includes("top") ? y + deltaY : mat.y,
                width: resizeHandle.includes("left")
                  ? Math.max(width - deltaX, 0)
                  : resizeHandle.includes("right")
                  ? Math.max(width + deltaX, 0)
                  : mat.width,
                height: resizeHandle.includes("top")
                  ? Math.max(height - deltaY, 0)
                  : resizeHandle.includes("bottom")
                  ? Math.max(height + deltaY, 0)
                  : mat.height,
              };
            }
            return mat;
          }
        );

        setCurrentMaterialData(updatedMaterialDataList[selectedMaterialIndex]);

        return updatedMaterialDataList;
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (!isResizing) {
      if (isDragging && selectedMaterialIndex !== null) {
        const { x, y } = currentMaterialData;
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setMaterial((prevMaterialDataList) => {
          const updatedMaterialDataList = [...prevMaterialDataList];
          const updatedMaterialData = {
            ...updatedMaterialDataList[selectedMaterialIndex],
          };
          updatedMaterialData.x = x + deltaX;
          updatedMaterialData.y = y + deltaY;
          updatedMaterialDataList[selectedMaterialIndex] = updatedMaterialData;
          return updatedMaterialDataList;
        });

        setCurrentMaterialData((prevData) => ({
          ...prevData,
          x: x + deltaX,
          y: y + deltaY,
        }));

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleImageDragStart = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleImageDrag = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setCurrentMaterialData((prevData) => ({
        ...prevData,
        x: prevData.x + deltaX,
        y: prevData.y + deltaY,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }

    if (isResizing && resizeHandle) {
      const { x, y, width, height } = currentMaterialData;
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setCurrentMaterialData((prevData) => {
        const updatedData = { ...prevData };

        if (resizeHandle.includes("left")) {
          updatedData.x = x + deltaX;
          updatedData.width = width - deltaX;
        }

        if (resizeHandle.includes("top")) {
          updatedData.y = y + deltaY;
          updatedData.height = height - deltaY;
        }

        if (resizeHandle.includes("right")) {
          updatedData.width = width + deltaX;
        }

        if (resizeHandle.includes("bottom")) {
          updatedData.height = height + deltaY;
        }

        return updatedData;
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleResizeMouseDown = (e, handle) => {
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const exportImage = async () => {
    setSelectedMaterialIndex(null);
    const matAllDiv = document.getElementById("mat-all");

    // Wait for all images to be fully loaded
    const imageLoadPromises = Array.from(
      matAllDiv.getElementsByTagName("img")
    ).map((img) => {
      return new Promise((resolve) => {
        img.onload = resolve;
      });
    });

    await Promise.all(imageLoadPromises);

    // Once images are loaded, proceed with capturing the screenshot
    html2canvas(matAllDiv, {
      allowTaint: true,
      useCORS: true,
    }).then((canvas) => {
      const imageUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = "exported-image.png";

      document.body.appendChild(downloadLink);
      downloadLink.click();

      document.body.removeChild(downloadLink);
    });
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "40px",
          display: "flex",
          justifyContent: "flex-start",
          marginLeft: "40px",
          marginBottom: "20px",
        }}
      >
        <button onClick={handleImageClick}>Add Material</button>
      </div>
      <div
        style={{
          width: "100%",
          padding: "20px 40px 20px 40px",
          display: "flex",
        }}
      >
        <ConfigDiv>
          <h4>Edit Material</h4>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="radio"
              value="square"
              name="gender"
              checked={
                material[selectedMaterialIndex]?.type == "square" ? true : false
              }
              onChange={(e) => {
                setMaterial(
                  material.map((data, index) => {
                    if (index == selectedMaterialIndex) {
                      console.log("index", index, selectedMaterialIndex);
                      return { ...data, type: "square" };
                    } else {
                      return { ...data };
                    }
                  })
                );
                setCurrentMaterialData({ ...material[selectedMaterialIndex] });
              }}
            />
            Square
            <input
              type="radio"
              value="round"
              name="gender"
              checked={
                material[selectedMaterialIndex]?.type == "round" ? true : false
              }
              onChange={(e) => {
                setMaterial(
                  material.map((data, index) => {
                    if (index == selectedMaterialIndex) {
                      console.log("index", index, selectedMaterialIndex);
                      return { ...data, type: "round" };
                    } else {
                      return { ...data };
                    }
                  })
                );
                setCurrentMaterialData({ ...material[selectedMaterialIndex] });
              }}
            />
            Round
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>
              product:
              <input
                type="text"
                name="product"
                onChange={(e) => {
                  setMaterial(
                    material.map((data, index) => {
                      if (index == selectedMaterialIndex) {
                        return { ...data, img: e.target.value };
                      } else {
                        return { ...data };
                      }
                    })
                  );
                  setCurrentMaterialData({
                    ...material[selectedMaterialIndex],
                  });
                }}
                value={material[selectedMaterialIndex]?.img || ""}
              />
            </label>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>
              X:
              <input
                disabled
                type="text"
                name="x"
                onChange={handleMaterialChange}
                value={currentMaterialData.x || ""}
              />
            </label>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>
              Y:
              <input
                disabled
                type="text"
                name="y"
                onChange={handleMaterialChange}
                value={currentMaterialData.y || ""}
              />
            </label>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>
              Width:
              <input
                disabled
                type="text"
                name="width"
                onChange={handleMaterialChange}
                value={currentMaterialData.width || ""}
              />
            </label>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>
              Height:
              <input
                disabled
                type="text"
                name="height"
                onChange={handleMaterialChange}
                value={currentMaterialData.height || ""}
              />
            </label>
          </div>

          <button
            onClick={() => handleDeleteMaterial(selectedMaterialIndex)}
            style={{
              display: "block",
              height: "35px",
              alignItems: "center",
              alignContent: "center",
              margin: "auto 0",
            }}
          >
            Delete Material
          </button>
        </ConfigDiv>
        <BoardDiv
          id={`mat-all`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: "relative",
            overflow: "hidden",
            width: "80%",
            height: "600px",
            margin: "auto 1%",
            // backgroundImage: `url('https://t4.ftcdn.net/jpg/05/62/99/31/360_F_562993122_e7pGkeY8yMfXJcRmclsoIjtOoVDDgIlh.jpg')`,
            // backgroundRepeat: "no-repeat",
            // backgroundPosition: "center",
            // backgroundSize: "cover",
          }}
        >
          {material.map((mat, index) => (
            <div
              key={index}
              onMouseDown={(e) => handleMouseDown(e, index)}
              style={{
                position: "absolute",
                border:
                  selectedMaterialIndex === index
                    ? "0px solid blue"
                    : "0px solid red",
                boxSizing: "border-box",
                left: mat.x + "px",
                top: mat.y + "px",
                width: mat.width + "px",
                height: mat.height + "px",
                cursor: selectedMaterialIndex === index ? "move" : "default",
                backgroundImage: mat.img
                  ? `url(${mat.img})`
                  : `url(${"https://cdn.vectorstock.com/i/preview-1x/48/06/image-preview-icon-picture-placeholder-vector-31284806.jpg"})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: mat.type === "round" ? "50%" : "0%",
                // boxShadow:
                //   mat.type === "round"
                //     ? "rgba(0, 0, 0, 0.1) 1px 1px 8px 5px"
                //     : "rgba(0, 0, 0, 0.5) 1px 1px 6px 4px",
              }}
            >
              {selectedMaterialIndex === index && (
                <>
                  <div
                    className="resize-handle top-left"
                    onMouseDown={(e) => handleResizeMouseDown(e, "top-left")}
                  ></div>
                  <div
                    className="resize-handle top-right"
                    onMouseDown={(e) => handleResizeMouseDown(e, "top-right")}
                  ></div>
                  <div
                    className="resize-handle bottom-left"
                    onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")}
                  ></div>
                  <div
                    className="resize-handle bottom-right"
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, "bottom-right")
                    }
                  ></div>
                </>
              )}
            </div>
          ))}
        </BoardDiv>
        <OrderDiv>
          <h4>Order Material</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={material.map((data) => data.id)}
              strategy={verticalListSortingStrategy}
            >
              {material.map((mat, index) => (
                <div
                  key={mat.id}
                  style={{
                    // display: "flex",
                    width: "100%",
                  }}
                >
                  <SortableItem key={mat.id} id={mat.id} data={mat}>
                    <p style={{ marginRight: "5%" }}>{mat.id}</p>
                  </SortableItem>
                </div>
              ))}
            </SortableContext>
          </DndContext>
        </OrderDiv>
      </div>
      <div
        style={{
          width: "100%",
          height: "40px",
          display: "flex",
          justifyContent: "center",
          marginBottom: "40px",
        }}
      >
        <button onClick={exportImage}>Export Image</button>
      </div>
    </>
  );
};

export default MaterialBoard;
