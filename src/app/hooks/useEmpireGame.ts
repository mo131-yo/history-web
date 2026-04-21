// "use client";
// import { useState, useEffect, useCallback } from "react";

// // Барилгын төрлүүдийн тохиргоо
// export const BUILDING_TYPES = {
//   BARRACKS: { id: "barracks", name: "Цэргийн хүрээ", cost: 100, color: "#ef4444" },
//   MARKET: { id: "market", name: "Өртөө / Зах", cost: 150, color: "#fbbf24" },
//   TEMPLE: { id: "temple", name: "Сүм хийд", cost: 200, color: "#8b5cf6" },
// };

// export function useEmpireGame(currentYear: number) {
//   // Тоглоомын анхны төлөв (State)
//   const [resources, setResources] = useState({ gold: 500, food: 300, prestige: 10 });
//   const [buildings, setBuildings] = useState<any[]>([]);
//   const [selectedToBuild, setSelectedToBuild] = useState<string | null>(null);

//   // 1. Timeline ахихад (он солигдоход) нөөц автоматаар нэмэгдэнэ
//   useEffect(() => {
//     setResources((prev) => ({
//       gold: prev.gold + Math.floor(Math.random() * 30) + 20,
//       food: prev.food + Math.floor(Math.random() * 20) + 10,
//       prestige: prev.prestige + 2,
//     }));
//   }, [currentYear]);

//   // 2. Барилга барих функц
//   const placeBuilding = useCallback((lngLat: [number, number]) => {
//     if (!selectedToBuild) return false;

//     // Сонгосон барилгын төрлийг олох
//     const typeKey = Object.keys(BUILDING_TYPES).find(
//       (key) => (BUILDING_TYPES as any)[key].id === selectedToBuild
//     );
//     const bType = typeKey ? (BUILDING_TYPES as any)[typeKey] : null;

//     if (bType && resources.gold >= bType.cost) {
//       const newBuilding = {
//         id: `b-${Date.now()}`,
//         type: bType.id,
//         name: bType.name,
//         color: bType.color,
//         coordinates: lngLat,
//       };

//       setBuildings((prev) => [...prev, newBuilding]);
//       setResources((prev) => ({ ...prev, gold: prev.gold - bType.cost }));
//       setSelectedToBuild(null); // Баригдсаны дара A сонголтыг цэвэрлэнэ
//       return true;
//     } else {
//       alert("Алт хүрэлцэхгүй байна!");
//       return false;
//     }
//   }, [selectedToBuild, resources.gold]);

//   return { 
//     resources, 
//     buildings, 
//     selectedToBuild, 
//     setSelectedToBuild, 
//     placeBuilding 
//   };
// }