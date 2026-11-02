/* XADREZ multi-lance v0.1: 3 decisões do jogador, duas respostas forçadas da PV G5.
 * Exploratório; não certifica erros nem altera o scheduler G5.
 */
(function(root){
'use strict';
const UCI=/^[a-h][1-8][a-h][1-8][qrbn]?$/;
function build(puzzle,evidence,R){
 if(!puzzle||!evidence||evidence.exercise_id!==puzzle.id||evidence.position?.fen_before!==puzzle.fen||evidence.position?.ply!==puzzle.ply||evidence.candidate?.suggested_uci_g5!==puzzle.melhor_uci||evidence.quality?.diagnostic_certified!==false||evidence.quality?.legal_moves_verified!==true||evidence.verification?.status!=='ENGINE_EVIDENCE_RESEARCH_NOT_DIAGNOSIS')return {status:'unavailable',reason:'evidence_mismatch'};
 const forced=Array.isArray(evidence.lines)&&evidence.lines.find(x=>x.kind==='g5_forced'&&x.root_uci===puzzle.melhor_uci);
 if(!forced||!Array.isArray(forced.pv_uci)||forced.pv_uci.length<5)return {status:'unavailable',reason:'short_pv'};
 const line=forced.pv_uci.slice(0,5);
 if(line.some(x=>typeof x!=='string'||!UCI.test(x)))return {status:'unavailable',reason:'malformed_pv'};
 let board;
 try{
  board=R.parse(puzzle.fen);
  for(const uci of line){
   const m=R.legal(board).find(x=>R.uci(x)===uci);
   if(!m)return {status:'unavailable',reason:'illegal_pv'};
   board=R.apply(board,m);
  }
 }catch(e){return {status:'unavailable',reason:'invalid_fen'};}
 return {status:'ready',line,player_plies:3,opponent_plies:2,source:'g5_forced',experimental:true};
}
function begin(puzzle,plan,R){
 if(!plan||plan.status!=='ready')throw Error('Sequência não verificada');
 return {status:'playing',board:R.parse(puzzle.fen),line:plan.line.slice(),turn:0,player_moves:[],opponent_moves:[],hints:0};
}
function hint(session){return session?.status==='playing'?session.line[session.turn]:null;}
function play(session,uci,R){
 if(!session||session.status!=='playing'||session.turn%2!==0)throw Error('Sessão não aguarda lance humano');
 const move=R.legal(session.board).find(x=>R.uci(x)===uci);
 if(!move)return {...session,status:'illegal'};
 const played=session.player_moves.concat(uci),after=R.apply(session.board,move);
 if(uci!==session.line[session.turn])return {...session,board:after,player_moves:played,status:'deviation',automatic_reply:null,deviation_ply:session.turn/2+1,expected_uci:session.line[session.turn]};
 if(session.turn===4)return {...session,board:after,player_moves:played,turn:5,status:'complete',automatic_reply:null};
 const replyUci=session.line[session.turn+1],reply=R.legal(after).find(x=>R.uci(x)===replyUci);
 if(!reply)return {...session,board:after,player_moves:played,status:'invalid_response',automatic_reply:null};
 return {...session,board:R.apply(after,reply),player_moves:played,opponent_moves:session.opponent_moves.concat(replyUci),turn:session.turn+2,status:'playing',automatic_reply:replyUci};
}
root.Sequence3={build,begin,hint,play};
if(typeof module!=='undefined'&&module.exports)module.exports=root.Sequence3;
})(typeof globalThis!=='undefined'?globalThis:this);
