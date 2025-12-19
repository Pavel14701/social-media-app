import {Filter}  from "bad-words";

// создаём экземпляр фильтра с кастомным плейсхолдером
const filter = new Filter({ placeHolder: "X" });

export default filter;
