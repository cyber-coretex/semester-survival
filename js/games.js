'use strict';
Survival.ticTacToeOutcome = function(board) {
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const line of lines)if(board[line[0]]&&line.every(i=>board[i]===board[line[0]]))return {winner:board[line[0]],line};
  return board.every(Boolean)?{winner:'draw',line:[]}:null;
};
Survival.ticTacToeMove = function(board) {
  function minimax(b,player,depth){
    const end=Survival.ticTacToeOutcome(b);
    if(end)return end.winner==='O'?10-depth:end.winner==='X'?depth-10:0;
    const scores=[];
    for(let i=0;i<9;i++)if(!b[i]){b[i]=player;scores.push(minimax(b,player==='O'?'X':'O',depth+1));b[i]='';}
    return player==='O'?Math.max(...scores):Math.min(...scores);
  }
  let best=-Infinity,move=-1;
  const copy=board.slice();
  for(const i of [4,0,2,6,8,1,3,5,7])if(!copy[i]){copy[i]='O';const score=minimax(copy,'X',0);copy[i]='';if(score>best){best=score;move=i;}}
  return move;
};
(() => {
  let board=Array(9).fill(''),turn='X',over=false,thinking=false,pending=null;
  const scores={X:0,O:0,draw:0},grid=document.getElementById('ttt-board'),status=document.getElementById('ttt-status'),mode=document.getElementById('ttt-mode');
  for(let i=0;i<9;i++){const button=document.createElement('button');button.type='button';button.dataset.cell=i;button.addEventListener('click',()=>play(i));grid.append(button);}
  function render(line=[]){
    grid.querySelectorAll('button').forEach((button,i)=>{button.textContent=board[i];button.disabled=over||thinking||Boolean(board[i]);button.setAttribute('aria-label',`Feld ${i+1}: ${board[i]||'leer'}`);button.classList.toggle('winning',line.includes(i));});
    document.getElementById('ttt-score').textContent=`X: ${scores.X} Siege · O: ${scores.O} Siege · Unentschieden: ${scores.draw}`;
  }
  function finish(){const end=Survival.ticTacToeOutcome(board);if(!end)return false;over=true;scores[end.winner]++;status.textContent=end.winner==='draw'?'Unentschieden. Akademischer Stillstand.':`${end.winner} gewinnt. Endlich mal ein Erfolgserlebnis.`;render(end.line);return true;}
  function play(i){
    if(over||thinking||board[i])return;
    board[i]=turn;
    if(finish())return;
    turn=turn==='X'?'O':'X';
    if(mode.value==='computer'&&turn==='O'){
      thinking=true;status.textContent='hirn.exe rechnet ...';render();
      pending=setTimeout(()=>{pending=null;thinking=false;const move=Survival.ticTacToeMove(board);if(move>=0)board[move]='O';if(!finish()){turn='X';status.textContent='X ist dran. Du schaffst das. Vielleicht.';render();}},250);
    }else{status.textContent=`${turn} ist dran.`;render();}
  }
  function reset(){if(pending!==null)clearTimeout(pending);pending=null;board=Array(9).fill('');turn='X';over=false;thinking=false;status.textContent='X ist dran.';render();}
  mode.addEventListener('change',reset);document.getElementById('ttt-reset').addEventListener('click',reset);reset();
})();
