import { smooth } from './scene-math.mjs';

// Group words by their actual rendered line, including portrait wrapping and
// font-size changes. A pair must never span two headline lines.
export function readingLines(rects) {
 let top=null,height=0,line=-1;
 const order=rects.map(rect=>{
  if(top===null || Math.abs(rect.top-top)>Math.max(3,Math.min(height,rect.height)*.4)){
   top=rect.top;height=rect.height;line++;
  }
  return line;
 });
 return {order,count:line+1};
}
export function lineFormation(progress,index,count) {
 const delay=count>1 ? .24*index/(count-1) : 0;
 return smooth((progress-delay)/.76);
}
// Scrolling must never outrun legibility: the central reading area is clear.
export function readingFloor(top,viewport) {
 return smooth((viewport*.9-top)/Math.max(1,viewport*.28));
}
