/* Browser-safe dense Toxic Toby level source.
 * This replaces the compressed pack when loading and guarantees the game can
 * start on browsers where gzip streams or the packed asset fail.
 */
(() => {
  const EXPRESSIONS = ['neutral','evil_grin','gross','angry','maniacal_laugh'];
  const CONFIG = {
    1:{size:57,target:125,seed:16001,frontier:3},
    2:{size:59,target:132,seed:16002,frontier:3},
    3:{size:61,target:138,seed:16003,frontier:2},
    4:{size:63,target:145,seed:16004,frontier:2},
    5:{size:65,target:150,seed:16005,frontier:1},
  };
  const STYLE = {
    button_eye:'rust',button_core:'rust',infected_eye:'slime',infected_core:'slime',
    stitch:'stitch',patch:'patch',muzzle:'muzzle',nose:'nose',mouth:'mouth',
    teeth:'tooth',slime:'slime',left_inner_ear:'rust',right_inner_ear:'rust',
  };
  const DELTAS = [['up',-1,0],['right',0,1],['down',1,0],['left',0,-1]];
  const cache = new Map();

  function rng(seed){
    let value=seed>>>0;
    return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  }
  function key(row,col){return `${row}:${col}`;}
  function parse(value){const split=value.indexOf(':');return [Number(value.slice(0,split)),Number(value.slice(split+1))];}
  function direction(head,behind){
    const dr=head[0]-behind[0],dc=head[1]-behind[1];
    if(dr===-1)return 'up';if(dr===1)return 'down';if(dc===1)return 'right';return 'left';
  }
  function distanceToEdge(cell,size){return Math.min(cell[0],cell[1],size-1-cell[0],size-1-cell[1]);}

  function makeMask(size,expression){
    const half=(size-1)/2;
    const mask=new Set();
    const regions=new Map();
    const mouthY={neutral:.40,evil_grin:.39,gross:.41,angry:.40,maniacal_laugh:.39}[expression];
    for(let row=0;row<size;row+=1){
      for(let col=0;col<size;col+=1){
        const x=(col-half)/half,y=(row-half)/half;
        const head=(x/.625)**2+((y-.075)/.71)**2<=1;
        const leftEar=((x+.535)/.225)**2+((y+.54)/.225)**2<=1;
        const rightEar=((x-.535)/.225)**2+((y+.54)/.225)**2<=1;
        if(!(head||leftEar||rightEar))continue;
        if(y>.73&&Math.abs(x)>.24)continue;
        let region='fur';
        if(leftEar&&x<-.39&&y<-.34)region='left_ear';
        else if(rightEar&&x>.39&&y<-.34)region='right_ear';

        const leftInner=((x+.535)/.105)**2+((y+.54)/.115)**2;
        const rightInner=((x-.535)/.105)**2+((y+.54)/.115)**2;
        if(leftInner<1||rightInner<1)continue;
        if(leftInner>=1&&leftInner<2)region='left_inner_ear';
        if(rightInner>=1&&rightInner<2)region='right_inner_ear';

        const leftEye=((x+.255)/.145)**2+((y+.12)/.13)**2;
        const rightEye=((x-.255)/.155)**2+((y+.12)/.14)**2;
        if(leftEye>=.14&&leftEye<=1.35)region='button_eye';
        else if(leftEye<.14)region='button_core';
        if(rightEye>=.12&&rightEye<=1.35)region='infected_eye';
        else if(rightEye<.12)region='infected_core';
        if(leftEye<.045||rightEye<.04)continue;

        if(Math.abs(x)<.032&&y>-.63&&y<-.02)region='stitch';
        const patch=((x+.43)/.145)**2+((y-.105)/.16)**2;
        if(patch<=1&&(row+col)%7!==0)region='patch';
        const muzzle=(x/.33)**2+((y-.16)/.22)**2;
        if(muzzle>=.23&&muzzle<=1.28&&y>-.015)region='muzzle';
        const nose=(x/.13)**2+((y-.035)/.075)**2;
        if(nose<=1.15)region='nose';
        if(nose<.14)continue;
        const mouth=(x/.36)**2+((y-mouthY)/.14)**2;
        if(mouth>=.18&&mouth<=1.35&&y>.26)region='mouth';
        if((expression==='evil_grin'||expression==='maniacal_laugh')&&mouth<.62&&Math.abs(x)<.31&&y>.30)region='teeth';
        if(expression==='gross'&&x>-.01&&x<.22&&y>.24&&y<.70)region='slime';
        if(expression==='angry'&&y<-.20){
          if(x>-.43&&x<-.08&&Math.abs(y-(-.25-.35*(x+.25)))<.025)region='stitch';
          if(x>.08&&x<.43&&Math.abs(y-(-.25+.35*(x-.25)))<.025)region='stitch';
        }
        if(((leftEar&&x<-.58)||(rightEar&&x>.58))&&(row*3+col)%11<2)region='slime';
        if(expression!=='neutral'&&Math.abs(x)>.48&&y>0&&y<.48&&(row+col)%13===0)region='slime';
        if(Math.abs(x)<.10&&mouth<.10&&y>.32)continue;
        const cellKey=key(row,col);
        mask.add(cellKey);regions.set(cellKey,region);
      }
    }
    return {mask,regions};
  }

  function freeDegree(cellKey,available){
    const [row,col]=parse(cellKey);let count=0;
    for(const [,dr,dc] of DELTAS)if(available.has(key(row+dr,col+dc)))count+=1;
    return count;
  }

  function growPath(seedKey,available,regions,target,random){
    const desired=regions.get(seedKey);
    const path=[parse(seedKey)];
    const used=new Set([seedKey]);
    let previous=null,straight=0;
    while(path.length<target){
      const [row,col]=path[path.length-1];
      const choices=[];
      for(const [name,dr,dc] of DELTAS){
        const nextKey=key(row+dr,col+dc);
        if(!available.has(nextKey)||used.has(nextKey))continue;
        let touches=false;
        for(const [,ndr,ndc] of DELTAS){
          const neighbor=key(row+dr+ndr,col+dc+ndc);
          if(used.has(neighbor)&&neighbor!==key(row,col)){touches=true;break;}
        }
        if(touches)continue;
        const nextRegion=regions.get(nextKey);
        const same=nextRegion===desired?0:(STYLE[nextRegion]===STYLE[desired]?1:5);
        const turn=previous===null?0:(name===previous?(straight>=3?2:0):(straight>=2?0:1));
        choices.push([same,turn,-freeDegree(nextKey,available),random(),name,nextKey]);
      }
      if(!choices.length)break;
      choices.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]||a[3]-b[3]);
      const [, , , ,name,nextKey]=choices[0];
      straight=name===previous?straight+1:0;
      previous=name;used.add(nextKey);path.push(parse(nextKey));
    }
    return path;
  }

  function clone(value){return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));}

  function generate(level){
    if(cache.has(level))return clone(cache.get(level));
    const config=CONFIG[level];
    const expression=EXPRESSIONS[level-1];
    const random=rng(config.seed);
    const {mask,regions}=makeMask(config.size,expression);
    const available=new Set(mask);
    const totals=new Map();
    const filled=new Map();
    for(const region of regions.values())totals.set(region,(totals.get(region)||0)+1);
    const pieces=[];

    while(available.size&&pieces.length<config.target){
      const groups=new Map();
      for(const cellKey of available){
        const region=regions.get(cellKey);
        if(!groups.has(region))groups.set(region,[]);
        groups.get(region).push(cellKey);
      }
      let desiredRegion=null,best=-Infinity;
      for(const [region,cells] of groups){
        if(!cells.length)continue;
        const lowPriority=region==='fur'||region==='left_ear'||region==='right_ear';
        const target=(lowPriority?.91:.96)*(totals.get(region)||1);
        const deficit=(target-(filled.get(region)||0))/(totals.get(region)||1);
        const score=deficit+random()*.0001;
        if(score>best){best=score;desiredRegion=region;}
      }
      const candidates=groups.get(desiredRegion)||[...available];
      candidates.sort((a,b)=>freeDegree(a,available)-freeDegree(b,available)||random()-.5);
      const seedKey=candidates[0];
      const average=Math.max(6,Math.min(15,Math.round(available.size/Math.max(1,config.target-pieces.length))));
      const targetLength=Math.max(5,Math.min(17,average-2+Math.floor(random()*5)));
      let path=growPath(seedKey,available,regions,targetLength,random);
      if(path.length<2){available.delete(seedKey);continue;}
      for(const cell of path){
        const cellKey=key(cell[0],cell[1]);available.delete(cellKey);
        const region=regions.get(cellKey);filled.set(region,(filled.get(region)||0)+1);
      }
      if(distanceToEdge(path[path.length-1],config.size)<distanceToEdge(path[0],config.size))path=path.reverse();
      const head=path[0],behind=path[1];
      const region=regions.get(key(head[0],head[1]))||desiredRegion||'fur';
      pieces.push({
        id:`p${String(pieces.length+1).padStart(3,'0')}`,
        region,
        style:STYLE[region]||'fur',
        cells:path,
        exitDirection:direction(head,behind),
        headCell:head,
        tipCell:head,
      });
    }

    const data={
      schemaVersion:7,teddy:'tt01',characterName:'Toxic Toby',alternateName:'Radioactive Ricky',
      level,expression,gridSize:config.size,cellSize:24,pieceCount:pieces.length,pieces,
      solutionOrder:pieces.map(piece=>piece.id),strictSequence:true,allowedFrontier:config.frontier,
      decorations:[],visualAnchors:['torn circular ears','button eye','infected eye','forehead seam','muzzle and black nose','cheek patch','expression mouth','radioactive slime'],
      animation:{pauseMs:90,baseSlideMs:420,msPerCell:34,minSlideMs:760,maxSlideMs:1500,fadeStart:.8,mode:'head_first_pull_through'},
    };
    cache.set(level,data);
    return clone(data);
  }

  fetchLevel=async function browserSafeDenseFetchLevel(){
    const level=Math.max(1,Math.min(5,Number(state.level)||1));
    return generate(level);
  };
})();
