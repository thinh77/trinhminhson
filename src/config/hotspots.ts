export interface Hotspot {
  id: string;
  href: string;
  // path: Chuỗi tọa độ SVG (d="...") lấy từ SVG Path Editor
  path: string; 
}

export const hotspots: Hotspot[] = [
  {
    "id": "laptop",
    "href": "/blog",
    "path": "M922.5 585L932.5 442L1141 450L1129.5 602.5L1090.5 692L862.5 670L922.5 585Z"
  },
  {
    "id": "notebook",
    "href": "/about",
    "path": "M701.5 666.5L686.5 670.5V679L784 687.5L840 655V647.5L817.5 645L815 641.5L757 635.5L701.5 662.5V666.5Z"
  },
  {
    "id": "monitor",
    "href": "/videos",
    "path": "M1481 440.5L1172 416.5L1152 625.5L1305 666L1301 705H1293.5L1207.5 722.5L1316.5 760.5L1359.5 749C1357.5 719.5 1368 729.5 1377.5 725L1351 717L1354.5 678.5L1449.5 701.5L1454 700.5L1481 440.5Z"
  }
];