# A transfinite Number line where you can plugin and play!

## How to use the transfinte number lines

- Tap/Mouse Scroll/Arrow keys to zoom and pan

- A/S to adjust rendering depth

- M to switch notation

- Shift/Cltr to slow and fasten the controls

## How to inject custom notation

importantly, you must have at least 4 functions and gettings all the constant ready

```js
window.notation = (() => {

  //Required: Fundamental Sequence
  function fs(ord, n) {
    if(ord == Limit) returb expanLimit(n)
    return expab(ord,n);
  }

  //Required: Comparator
  function cmp(a, b) {
    //you must support limit as an input
    if (a == Limit && b == Limit) return 0;
    if (a == Limit) return 1;
    if (b == Limit) return -1;

    return compare(a,b)
  }

  //Required: Successor check
  function isSuccessor(ord) {
    return ord.isSuccessor
  }
 
  //Required: convert your ordinal into displayable string. Support html tags
  function display(ord, mode) {
    if(mode=="mode 1") returb ord.toString
    if(mode=="mode 2") returb ord.toOrdinal 
    //more modes here. Dont forget to add those to DisplayName so my program could know that
  }

  //this function will color yours ordinal number lind
  function classifyOrdinal(ord) {
    if (ord.IsZero)
      return "#808080"; //Expecting HEX color as output

    if (ord.IsSuccessor)
      return "#d40000";

    if (ord.isLimit)
      return "#ff8000"; 

  }

  //Compulsory : you have to fill this your self. This should also be a valid input for all main functions
  const Zero = []; //smallest ordinal
  const Limit = "Limit"; //largest ordinal

  //List your notation name here. These will be the agrument 'mode' inside display functions
  const DisplayName = ["mode 1", 'mode 2'];

  //This will be show as a legend gui
  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"]
    //adding more if your notations supporting it
  ];

  //Adding your important ordinal here
  const Aliases = [
    ["An important ordinal", ImporOrd.Value]
  ];
  
  //currently have no function yet
  const config = {types: "default"};

  const title = "Your transfinite number line";

  return {fs,cmp,isSuccessor,display,classifyOrdinal,parse,Zero,Limit,DisplayName,ordinalTypes,Aliases,config,title};

})();

//You can either add yours helpers outside or inside the IIEF
function helpers(M) {
    Return M.map(x=>x)
}
```

