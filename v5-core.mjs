export const SCHEMA_VERSION=5;
export const uid=(p='id')=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
export const clone=v=>globalThis.structuredClone?structuredClone(v):JSON.parse(JSON.stringify(v));
export const slugify=(value='')=>{const map={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sh','ы':'y','э':'e','ю':'yu','я':'ya','ъ':'','ь':'','ə':'e','ı':'i','ö':'o','ü':'u','ğ':'g','ş':'s','ç':'c'};return String(value).toLowerCase().split('').map(c=>map[c]??c).join('').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)};
export const escapeHtml=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
export const escapeAttr=escapeHtml;
export const baseTheme=()=>({fonts:{heading:'Inter, Arial, sans-serif',body:'Inter, Arial, sans-serif'},colors:{primary:'#705cff',secondary:'#17142b',accent:'#ff9d66',text:'#111827',muted:'#667085',background:'#ffffff',surface:'#f7f7fb',border:'#dfe3ec'},typography:{h1:{size:56,weight:800,lineHeight:1.05},h2:{size:40,weight:750,lineHeight:1.12},h3:{size:24,weight:700,lineHeight:1.2},body:{size:18,weight:400,lineHeight:1.55}},button:{radius:10,paddingX:24,paddingY:13},containerWidth:1120,spacing:8,customCss:'',favicon:''});
export const defaultSeo=name=>({title:name||'',description:'',keywords:'',ogTitle:'',ogDescription:'',ogImage:'',canonical:'',noindex:false,jsonLd:''});
export const linkNone=()=>({type:'none',value:'',newTab:false,nofollow:false});
export const styleBag=()=>({base:{},tablet:{},mobile:{},hover:{},focus:{}});
export function node(type,props={},children=[]){return{id:uid('el'),type,name:'',props,style:styleBag(),locked:false,hidden:false,children}}
export function container(children=[],opts={}){const n=node('container',{layout:opts.layout||'flex',direction:opts.direction||'column',columns:opts.columns||1,gap:opts.gap??16,align:opts.align||'stretch',justify:opts.justify||'flex-start',wrap:opts.wrap||'wrap',overflow:opts.overflow||'visible',link:linkNone()},children);Object.assign(n.style.base,{display:n.props.layout==='grid'?'grid':'flex',flexDirection:n.props.direction,gap:`${Number(n.props.gap)||0}px`,alignItems:n.props.align,justifyContent:n.props.justify,flexWrap:n.props.wrap,overflow:n.props.overflow});if(n.props.layout==='grid')n.style.base.gridTemplateColumns=`repeat(${Number(n.props.columns)||1},minmax(0,1fr))`;return n}
export function block(name='Section',root=container()){return{id:uid('block'),type:'section',name,anchor:'',globalRole:'',preset:'',contentWidth:'',style:{base:{background:'#fff',color:'#111827',paddingTop:'64px',paddingBottom:'64px',paddingLeft:'24px',paddingRight:'24px'},tablet:{},mobile:{},hover:{},focus:{}},root}}
export const makeHeading=(text='Heading',level=2)=>node('heading',{text,level,link:linkNone()});
export const makeText=(text='Text')=>node('text',{text,link:linkNone()});
export const makeButton=(text='Button')=>node('button',{text,link:linkNone(),variant:'filled',size:'md',icon:'',iconPos:'right'});
export const makeImage=(src='',alt='Image')=>node('image',{src,alt,fit:'cover',position:'50% 50%',caption:'',link:linkNone(),lightbox:false,lazy:true});
export function makeImageTextItem(index=1){const c=container([makeImage('',`Image ${index}`),makeHeading(`Заголовок ${index}`,3),makeText('Краткое описание элемента.'),makeButton('Подробнее')],{gap:12});Object.assign(c.style.base,{padding:'16px',border:'1px solid #dfe3ec',borderRadius:'16px'});c.props.repeatItem='imageText';return c}
export function makeImageTextGrid(count=6){const safe=Math.max(1,Math.min(500,Number(count)||1)),grid=container(Array.from({length:safe},(_,i)=>makeImageTextItem(i+1)),{gap:16});grid.props.repeatTemplate='imageText';grid.props.itemCount=safe;grid.style.base.display='grid';grid.style.base.gridTemplateColumns='repeat(3,minmax(0,1fr))';grid.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.mobile.gridTemplateColumns='1fr';return grid}
export const makeSpacer=(size=48)=>node('spacer',{size});
export const makeDivider=()=>node('divider',{});
export const makeIcon=(icon='★')=>node('icon',{icon,label:''});
export const makeList=(items=['Item 1','Item 2'])=>node('list',{ordered:false,items});
export const makeVideo=(url='')=>node('video',{url,autoplay:false,controls:true,poster:''});
export const makeEmbed=(html='')=>node('embed',{html});
export const makeSocial=(items=[{label:'LinkedIn',url:'#'},{label:'Instagram',url:'#'}])=>node('social',{items});
export const makeLogo=(text='NOVA',src='')=>node('logo',{text,src,alt:'Logo',link:linkNone()});
export const makeTable=()=>node('table',{rows:[['A','B'],['1','2']],header:true});
export const makeMap=(url='')=>node('map',{url,title:'Map'});
export const makeCounter=(value=100,suffix='%')=>node('counter',{value,suffix,prefix:'',label:'Metric'});
export const makeAccordion=(items=[{id:uid('faq'),q:'Question 1',a:'Answer'},{id:uid('faq'),q:'Question 2',a:'Answer'}])=>node('accordion',{items,multiple:true,openCount:1});
export const makeTabs=(items=[{id:uid('tab'),label:'Tab 1',content:'Content 1'},{id:uid('tab'),label:'Tab 2',content:'Content 2'}])=>node('tabs',{items,active:0});
export const makeHtml=(html='<div>HTML</div>')=>node('html',{html});
export const makeNav=()=>node('nav',{logoText:'NOVA',logoImage:'',logoAlt:'Logo',logoWidth:140,logoHeight:44,mode:'auto',items:[],desktopAlign:'center',desktopGap:20,background:'#ffffff',textColor:'#111827',dropdownBackground:'#ffffff',dropdownText:'#111827',mobileIcon:'☰',mobileIconPosition:'right',mobileIconSize:24,mobilePanel:'right',mobilePanelWidth:280,mobileBackground:'#ffffff',mobileText:'#111827',sticky:false,transparent:false,cta:{enabled:true,text:'Начать',variant:'filled',position:'right',link:linkNone()}});
export const makeGallery=(count=3)=>node('gallery',{columns:{base:3,tablet:2,mobile:1},gap:16,ratio:'4/3',masonry:false,lightbox:true,items:Array.from({length:count},(_,i)=>({id:uid('img'),src:'',alt:`Image ${i+1}`,caption:'',link:linkNone()}))});