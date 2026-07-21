from __future__ import annotations
import argparse,base64,gzip,json,math,random
from pathlib import Path

DIRS={'up':(-1,0),'right':(0,1),'down':(1,0),'left':(0,-1)}
DNAME={value:name for name,value in DIRS.items()}
EXPRESSIONS=['neutral','evil_grin','gross','angry','maniacal_laugh']
CONFIG={1:(57,125,26001,220),2:(59,132,26002,225),3:(61,138,26003,235),4:(63,145,26004,245),5:(65,150,26005,255)}
STYLE={'button_eye':'rust','button_core':'rust','infected_eye':'slime','infected_core':'slime','stitch':'stitch','patch':'patch','muzzle':'muzzle','nose':'nose','mouth':'mouth','teeth':'tooth','slime':'slime','left_inner_ear':'rust','right_inner_ear':'rust'}

def add(cell,delta):return cell[0]+delta[0],cell[1]+delta[1]
def man(a,b):return abs(a[0]-b[0])+abs(a[1]-b[1])
def radial(cell,size):
 half=(size-1)/2;return math.hypot(cell[0]-half,cell[1]-half)

def make_mask(size,expression):
 half=(size-1)/2;mask=set();regions={};mouth_y={'neutral':.40,'evil_grin':.39,'gross':.41,'angry':.40,'maniacal_laugh':.39}[expression]
 for row in range(size):
  for col in range(size):
   x=(col-half)/half;y=(row-half)/half
   head=(x/.625)**2+((y-.075)/.71)**2<=1;left_ear=((x+.535)/.225)**2+((y+.54)/.225)**2<=1;right_ear=((x-.535)/.225)**2+((y+.54)/.225)**2<=1
   if not(head or left_ear or right_ear) or (y>.73 and abs(x)>.24):continue
   region='fur'
   if left_ear and x<-.39 and y<-.34:region='left_ear'
   elif right_ear and x>.39 and y<-.34:region='right_ear'
   left_inner=((x+.535)/.105)**2+((y+.54)/.115)**2;right_inner=((x-.535)/.105)**2+((y+.54)/.115)**2
   if left_inner<1 or right_inner<1:continue
   if 1<=left_inner<2:region='left_inner_ear'
   if 1<=right_inner<2:region='right_inner_ear'
   left_eye=((x+.255)/.145)**2+((y+.12)/.13)**2;right_eye=((x-.255)/.155)**2+((y+.12)/.14)**2
   if .14<=left_eye<=1.35:region='button_eye'
   elif left_eye<.14:region='button_core'
   if .12<=right_eye<=1.35:region='infected_eye'
   elif right_eye<.12:region='infected_core'
   if left_eye<.045 or right_eye<.04:continue
   if abs(x)<.032 and -.63<y<-.02:region='stitch'
   patch=((x+.43)/.145)**2+((y-.105)/.16)**2
   if patch<=1 and (row+col)%7:region='patch'
   muzzle=(x/.33)**2+((y-.16)/.22)**2
   if .23<=muzzle<=1.28 and y>-.015:region='muzzle'
   nose=(x/.13)**2+((y-.035)/.075)**2
   if nose<=1.15:region='nose'
   if nose<.14:continue
   mouth=(x/.36)**2+((y-mouth_y)/.14)**2
   if .18<=mouth<=1.35 and y>.26:region='mouth'
   if expression in {'evil_grin','maniacal_laugh'} and mouth<.62 and abs(x)<.31 and y>.30:region='teeth'
   if expression=='gross' and -.01<x<.22 and .24<y<.70:region='slime'
   if expression=='angry' and y<-.20:
    if -.43<x<-.08 and abs(y-(-.25-.35*(x+.25)))<.025:region='stitch'
    if .08<x<.43 and abs(y-(-.25+.35*(x-.25)))<.025:region='stitch'
   if ((left_ear and x<-.58) or (right_ear and x>.58)) and (row*3+col)%11<2:region='slime'
   if expression!='neutral' and abs(x)>.48 and 0<y<.48 and (row+col)%13==0:region='slime'
   if abs(x)<.10 and mouth<.10 and y>.32:continue
   mask.add((row,col));regions[(row,col)]=region
 return mask,regions

def free_degree(cell,available):return sum(add(cell,delta) in available for delta in DIRS.values())

def grow(seed,available,regions,target,rng):
 desired=regions[seed];path=[seed];used={seed};previous=None;straight=0
 while len(path)<target:
  current=path[-1];choices=[]
  for name,delta in DIRS.items():
   nxt=add(current,delta)
   if nxt not in available or nxt in used:continue
   if any(add(nxt,neighbor) in used and add(nxt,neighbor)!=current for neighbor in DIRS.values()):continue
   next_region=regions[nxt];same=0 if next_region==desired else (1 if STYLE.get(next_region)==STYLE.get(desired) else 5)
   turn=0 if previous is None else (2 if name==previous and straight>=3 else (0 if name==previous or straight>=2 else 1))
   choices.append((same,turn,-free_degree(nxt,available),rng.random(),name,nxt))
  if not choices:break
  choices.sort();*_,name,nxt=choices[0];straight=straight+1 if name==previous else 0;previous=name;path.append(nxt);used.add(nxt)
 return path

def can_exit(cells,direction,occupancy,own_id,size):
 dr,dc=DIRS[direction];row,col=cells[0];row+=dr;col+=dc
 while 0<=row<size and 0<=col<size:
  blocker=occupancy.get((row,col))
  if blocker and blocker!=own_id:return False
  row+=dr;col+=dc
 return True

def orientations(path,size):
 half=(size-1)/2;output=[]
 for cells in (path,list(reversed(path))):
  direction=DNAME[(cells[0][0]-cells[1][0],cells[0][1]-cells[1][1])];dr,dc=DIRS[direction];head=cells[0]
  output.append((-(head[0]-half)*dr-(head[1]-half)*dc,cells,direction))
 output.sort();return [(cells,direction) for _,cells,direction in output]

def verify(pieces,order,size):
 by_id={piece['id']:piece for piece in pieces};occupancy={tuple(cell):piece['id'] for piece in pieces for cell in piece['cells']}
 for piece_id in order:
  piece=by_id[piece_id];cells=list(map(tuple,piece['cells']))
  if not can_exit(cells,piece['exitDirection'],occupancy,piece_id,size):return False
  for cell in cells:occupancy.pop(cell,None)
 return True

def make_level(level):
 size,target,seed,max_pieces=CONFIG[level];expression=EXPRESSIONS[level-1];rng=random.Random(seed);mask,regions=make_mask(size,expression);available=set(mask);occupancy={};pieces=[]
 while len(available)>=2 and len(pieces)<max_pieces:
  coverage=(len(mask)-len(available))/len(mask)
  if coverage>=.80 and len(pieces)>=target:break
  candidates=sorted(available,key=lambda cell:(radial(cell,size),free_degree(cell,available),rng.random()));accepted=None
  for seed_cell in candidates[:500]:
   for length in (12,10,8,6,5,4,3,2):
    path=grow(seed_cell,available,regions,length,rng)
    if len(path)<2:continue
    for cells,direction in orientations(path,size):
     if can_exit(cells,direction,occupancy,'__candidate__',size):accepted=(seed_cell,path,cells,direction);break
    if accepted:break
   if accepted:break
  if not accepted:break
  seed_cell,path,cells,direction=accepted;piece_id=f'p{len(pieces)+1:03d}';region=regions.get(seed_cell,'fur')
  piece={'id':piece_id,'region':region,'style':STYLE.get(region,'fur'),'cells':[list(cell) for cell in cells],'exitDirection':direction,'headCell':list(cells[0]),'tipCell':list(cells[0])}
  for cell in path:available.discard(cell);occupancy[cell]=piece_id
  pieces.append(piece)
 order=[piece['id'] for piece in reversed(pieces)];assert verify(pieces,order,size)
 start_occupancy={tuple(cell):piece['id'] for piece in pieces for cell in piece['cells']};open_count=sum(can_exit(list(map(tuple,piece['cells'])),piece['exitDirection'],start_occupancy,piece['id'],size) for piece in pieces);coverage=(len(mask)-len(available))/len(mask)
 return {'schemaVersion':10,'teddy':'tt01','characterName':'Toxic Toby','alternateName':'Radioactive Ricky','level':level,'expression':expression,'gridSize':size,'cellSize':24,'pieceCount':len(pieces),'pieces':pieces,'solutionOrder':order,'strictSequence':False,'movementRule':'arrowhead_ray_clear_to_edge','decorations':[],'visualAnchors':['torn circular ears','button eye','infected eye','forehead seam','muzzle and black nose','cheek patch','expression mouth','radioactive slime'],'quality':{'coverage':round(coverage,3),'verifiedSolvable':True,'startingOpenPieces':open_count,'startingBlockedPieces':len(pieces)-open_count,'solver':'reverse_construction_head_ray_v1'},'animation':{'pauseMs':90,'baseSlideMs':420,'msPerCell':34,'minSlideMs':760,'maxSlideMs':1500,'fadeStart':.8,'mode':'head_first_pull_through'}}

def audit(data):
 size=data['gridSize'];occupied={}
 for piece in data['pieces']:
  cells=list(map(tuple,piece['cells']));assert 2<=len(cells)<=17 and len(cells)==len(set(cells))
  for index,cell in enumerate(cells):
   assert 0<=cell[0]<size and 0<=cell[1]<size and cell not in occupied
   occupied[cell]=piece['id']
   if index:assert man(cell,cells[index-1])==1
  assert DNAME[(cells[0][0]-cells[1][0],cells[0][1]-cells[1][1])]==piece['exitDirection']
 assert data['quality']['verifiedSolvable'];assert data['quality']['startingOpenPieces']>0;assert data['quality']['startingBlockedPieces']>0;assert verify(data['pieces'],data['solutionOrder'],size)

def main():
 parser=argparse.ArgumentParser(description='Compile solver-verified Toxic Toby head-ray levels');parser.add_argument('--output',type=Path,default=Path('levels/tt01'));parser.add_argument('--verify',type=Path);args=parser.parse_args()
 if args.verify:
  data=json.loads(args.verify.read_text(encoding='utf-8'));audit(data);print(f"PASS {args.verify}");return
 args.output.mkdir(parents=True,exist_ok=True);pack={};manifest={'schemaVersion':10,'teddy':'tt01','movementRule':'arrowhead_ray_clear_to_edge','levels':[]}
 for level in range(1,6):
  data=make_level(level);audit(data);pack[str(level)]=data;(args.output/f'level-{level}.json').write_text(json.dumps(data,indent=2),encoding='utf-8');manifest['levels'].append({'level':level,'pieceCount':data['pieceCount'],**data['quality']});print('PASS',manifest['levels'][-1])
 packed=base64.b64encode(gzip.compress(json.dumps(pack,separators=(',',':')).encode(),compresslevel=9)).decode();(args.output/'dense-levels-v10.txt').write_text(packed,encoding='ascii');(args.output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')

if __name__=='__main__':main()