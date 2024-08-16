import React, { useState } from "react";
import "../../App.css"; // Assuming the CSS above is in styles.css

const ListComponent = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
  ]);

  const shuffleItems = () => {
    // Shuffle the items array to change the order
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffledItems);
  };

  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li
            key={item.id}
            className="list-item"
            style={{ transform: `translateY(${index * 50}px)` }}
          >
            {item.name}
          </li>
        ))}
      </ul>
      <button onClick={shuffleItems}>Shuffle Items</button>
    </div>
  );
};

export default ListComponent;
