from __future__ import annotations
import base64,gzip,json,random
from collections import Counter,defaultdict
from pathlib import Path

DIRS={'up':(-1,0),'right':(0,1),'down':(1,0),'left':(0,-1)}
DNAME={v:k for k,v in DIRS.items()}
EXP=['neutral','evil_grin','gross','angry','maniacal_laugh']
CONFIG={1:(57,125,16001),2:(59,132,16002),3:(61,138,16003),4:(63,145,16004),5:(65,150,16005)}
STYLE={
'button_eye':'rust','button_core':'rust','infected_eye':'slime','infected_core':'slime',
'stitch':'stitch','patch':'patch','muzzle':'muzzle','nose':'nose','mouth':'mouth',
'teeth':'tooth','slime':'slime','left_ear':'fur','right_ear':'fur','left_inner_ear':'rust','right_inner_ear':'rust','fur':'fur'}
REQ={'fur','left_ear','right_ear','button_eye','infected_eye','stitch','patch','muzzle','nose','mouth','slime'}

def add(a,b):return a[0]+b[0],a[1]+b[1]
def man(a,b):return abs(a[0]-b[0])+abs(a[1]-b[1])

def component(cells, seed):
    q=[seed]; seen={seed}
    while q:
        c=q.pop()
        for d in DIRS.values():
            n=add(c,d)
            if n in cells and n not in seen: seen.add(n);q.append(n)
    return seen

def make_mask(size,expr):
    half=(size-1)/2
    mask=set(); reg={}
    my={'neutral':.40,'evil_grin':.39,'gross':.41,'angry':.40,'maniacal_laugh':.39}[expr]
    for r in range(size):
      for c in range(size):
        x=(c-half)/half;y=(r-half)/half
        head=(x/.625)**2+((y-.075)/.71)**2<=1
        le=((x+.535)/.225)**2+((y+.54)/.225)**2<=1
        re=((x-.535)/.225)**2+((y+.54)/.225)**2<=1
        if not(head or le or re):continue
        if y>.73 and abs(x)>.24:continue
        region='fur'
        if le and x<-.39 and y<-.34:region='left_ear'
        elif re and x>.39 and y<-.34:region='right_ear'
        lie=((x+.535)/.105)**2+((y+.54)/.115)**2
        rie=((x-.535)/.105)**2+((y+.54)/.115)**2
        if lie<1 or rie<1:continue
        if 1<=lie<2.0:region='left_inner_ear'
        if 1<=rie<2.0:region='right_inner_ear'
        l=((x+.255)/.145)**2+((y+.12)/.13)**2
        rr=((x-.255)/.155)**2+((y+.12)/.14)**2
        if .14<=l<=1.35:region='button_eye'
        elif l<.14: region='button_core'
        if .12<=rr<=1.35:region='infected_eye'
        elif rr<.12:region='infected_core'
        if l<.045 or rr<.04:continue
        if abs(x)<.032 and -.63<y<-.02:region='stitch'
        patch=((x+.43)/.145)**2+((y-.105)/.16)**2
        if patch<=1 and (r+c)%7!=0:region='patch'
        muz=(x/.33)**2+((y-.16)/.22)**2
        if .23<=muz<=1.28 and y>-.015:region='muzzle'
        nose=(x/.13)**2+((y-.035)/.075)**2
        if nose<=1.15:region='nose'
        if nose<.14:continue
        mouth=(x/.36)**2+((y-my)/.14)**2
        if .18<=mouth<=1.35 and y>.26:region='mouth'
        if expr in {'evil_grin','maniacal_laugh'} and mouth<.62 and abs(x)<.31 and y>.30:region='teeth'
        if expr=='gross' and -.01<x<.22 and .24<y<.70:region='slime'
        if expr=='angry' and y<-.20:
            if -.43<x<-.08 and abs(y-(-.25-.35*(x+.25)))<.025:region='stitch'
            if .08<x<.43 and abs(y-(-.25+.35*(x-.25)))<.025:region='stitch'
        if ((le and x<-.58) or (re and x>.58)) and (r*3+c)%11 in (0,1):region='slime'
        if expr!='neutral' and abs(x)>.48 and .0<y<.48 and (r+c)%13==0:region='slime'
        if abs(x)<.10 and mouth<.10 and y>.32:continue
        mask.add((r,c));reg[(r,c)]=region
    seed=min(mask,key=lambda p:abs(p[0]-half)+abs(p[1]-half))
    main=component(mask,seed)
    return main,{c:reg[c] for c in main}

def path_turns(path):
    return sum((path[i][0]-path[i-1][0],path[i][1]-path[i-1][1])!=(path[i-1][0]-path[i-2][0],path[i-1][1]-path[i-2][1]) for i in range(2,len(path)))

def grow(seed,available,regions,target,rng):
    desired=regions[seed];path=[seed];used={seed};prev=None;straight=0
    while len(path)<target:
      cur=path[-1];opts=[]
      for name,d in DIRS.items():
        n=add(cur,d)
        if n not in available or n in used:continue
        deg=sum(add(n,dd) in available and add(n,dd) not in used for dd in DIRS.values())
        same=0 if regions[n]==desired else (1 if STYLE.get(regions[n])==STYLE.get(desired) else 5)
        if prev is None:turn=0
        elif name==prev:turn=2 if straight>=3 else 0
        else:turn=0 if straight>=2 else 1
        opts.append((same,turn,-deg,rng.random(),name,n))
      if not opts:break
      opts.sort();_,_,_,_,name,n=opts[0]
      straight=straight+1 if name==prev else 0
      prev=name;path.append(n);used.add(n)
    return path

def make_level(level):
    size,target_count,seed=CONFIG[level];expr=EXP[level-1];rng=random.Random(seed)
    mask,regions=make_mask(size,expr);available=set(mask);pieces=[]
    totals=Counter(regions.values());filled=Counter()
    while available and len(pieces)<target_count:
      groups=defaultdict(list)
      for cell in available:groups[regions[cell]].append(cell)
      priorities=[]
      for region,cells in groups.items():
        desired=.96 if region not in {'fur','left_ear','right_ear'} else .91
        deficit=desired*totals[region]-filled[region]
        priorities.append((-deficit/max(totals[region],1),rng.random(),region))
      priorities.sort();region=priorities[0][2]
      candidates=groups[region]
      candidates.sort(key=lambda c:(sum(add(c,d) in available for d in DIRS.values()),rng.random()))
      seed_cell=candidates[0]
      remain=len(available);left=max(1,target_count-len(pieces));avg=max(6,min(15,round(remain/left)))
      target=rng.randint(max(5,avg-2),min(17,avg+2))
      path=grow(seed_cell,available,regions,target,rng)
      if len(path)<2:available.remove(seed_cell);continue
      for cell in path:available.remove(cell)
      filled.update(regions[cell] for cell in path)
      major=regions[seed_cell]
      e0=min(path[0][0],size-1-path[0][0],path[0][1],size-1-path[0][1]);e1=min(path[-1][0],size-1-path[-1][0],path[-1][1],size-1-path[-1][1])
      if e1<e0:path=list(reversed(path))
      head,behind=path[0],path[1];direction=DNAME[(head[0]-behind[0],head[1]-behind[1])]
      pieces.append({'id':f'p{len(pieces)+1:03d}','region':major,'style':STYLE.get(major,'fur'),'cells':[list(c) for c in path],'exitDirection':direction,'headCell':list(head),'tipCell':list(head)})
    used={tuple(cell) for piece in pieces for cell in piece['cells']};used_regions=Counter(regions[cell] for cell in used)
    quality={'maskCells':len(mask),'occupiedCells':len(used),'coverage':round(len(used)/len(mask),3),'pieceCount':len(pieces),'pieceLengthMean':round(sum(len(piece['cells']) for piece in pieces)/len(pieces),2),'turnRatio':round(sum(path_turns([tuple(c) for c in piece['cells']]) for piece in pieces)/max(1,sum(len(piece['cells'])-1 for piece in pieces)),3),'regionCoverage':{region:round(used_regions[region]/count,3) for region,count in totals.items() if count>=3}}
    return {'schemaVersion':6,'teddy':'tt01','characterName':'Toxic Toby','alternateName':'Radioactive Ricky','level':level,'expression':expr,'gridSize':size,'cellSize':24,'pieceCount':len(pieces),'pieces':pieces,'solutionOrder':[piece['id'] for piece in pieces],'strictSequence':True,'allowedFrontier':{1:3,2:3,3:2,4:2,5:1}[level],'decorations':[],'visualAnchors':['torn circular ears','button eye','infected eye','forehead seam','muzzle and black nose','cheek patch','expression mouth','radioactive slime'],'quality':quality,'animation':{'pauseMs':90,'baseSlideMs':420,'msPerCell':34,'minSlideMs':760,'maxSlideMs':1500,'fadeStart':.8,'mode':'head_first_pull_through'}}

def audit(data):
  occupied={};regions=set();size=data['gridSize']
  for piece in data['pieces']:
    cells=list(map(tuple,piece['cells']));assert 2<=len(cells)<=17
    assert len(cells)==len(set(cells))
    for index,cell in enumerate(cells):
      assert 0<=cell[0]<size and 0<=cell[1]<size and cell not in occupied
      occupied[cell]=piece['id']
      if index:assert man(cell,cells[index-1])==1
    assert DNAME[(cells[0][0]-cells[1][0],cells[0][1]-cells[1][1])]==piece['exitDirection']
    regions.add(piece['region'])
  assert data['quality']['coverage']>=.82,(data['level'],data['quality'])
  assert len(data['pieces'])>=CONFIG[data['level']][1]*.9
  assert REQ-regions==set(),REQ-regions

def main():
 import argparse
 parser=argparse.ArgumentParser(description='Build and audit dense Toxic Toby arrow-face levels')
 parser.add_argument('--output',type=Path,default=Path('levels/tt01'))
 parser.add_argument('--verify',type=Path)
 args=parser.parse_args()
 if args.verify:
  data=json.loads(args.verify.read_text(encoding='utf-8'));audit(data)
  print(f"PASS {args.verify}: {data['pieceCount']} paths, {data['quality']['coverage']:.1%} coverage")
  return
 args.output.mkdir(parents=True,exist_ok=True)
 pack={};manifest={'schemaVersion':6,'teddy':'tt01','characterName':'Toxic Toby','alternateName':'Radioactive Ricky','pack':'levels/tt01/dense-levels-v6.txt','levels':[]}
 for level in range(1,6):
  data=make_level(level);audit(data);pack[str(level)]=data
  (args.output/f'level-{level}.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
  manifest['levels'].append({'level':level,'expression':data['expression'],'pieceCount':data['pieceCount'],'quality':data['quality']})
  print(f"PASS level {level}: {data['pieceCount']} paths, {data['quality']['coverage']:.1%} coverage")
 raw=json.dumps(pack,separators=(',',':')).encode('utf-8')
 packed=base64.b64encode(gzip.compress(raw,compresslevel=9)).decode('ascii')
 (args.output/'dense-levels-v6.txt').write_text(packed,encoding='ascii')
 (args.output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')

if __name__=='__main__':
 main()
