const {useState, useEffect, useRef, createContext, useContext} = React;
const ReactFlow = window.ReactFlow;

const DataContext = createContext();

function App(){
  const [excelData,setExcelData] = useState([]);
  const [jsonData,setJsonData] = useState(null);
  const [view,setView] = useState('topology');

  return (
    <DataContext.Provider value={{excelData,setExcelData,jsonData,setJsonData}}>
    <div>
      <div className="sidebar">
        <button onClick={()=>setView('topology')}>Topology View</button>
        <button onClick={()=>setView('devices')}>Device List View</button>
        <button onClick={()=>setView('ce')}>C&E Editor</button>
        <input type="file" accept=".xlsx" onChange={handleExcelUpload}/>
        <input type="file" accept=".json" onChange={handleJsonUpload}/>
      </div>
      {view==='topology' && <TopologyView/>}
      {view==='devices' && <DeviceListView/>}
      {view==='ce' && <CEditorView/>}
    </div>
    </DataContext.Provider>
  );

  function handleExcelUpload(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data,{type:'array'});
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(firstSheet);
      setExcelData(json);
    };
    reader.readAsArrayBuffer(file);
  }

  function handleJsonUpload(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setJsonData(JSON.parse(evt.target.result));
    };
    reader.readAsText(file);
  }
}

function TopologyView(){
  const {jsonData} = useContext(DataContext);
  const [elements,setElements] = useState({nodes:[],edges:[]});
  useEffect(()=>{
    if(!jsonData) return;
    const devicesMap = new Map();
    jsonData.changedDevicesStream.forEach(d => {
      devicesMap.set(d.Id,d);
    });
    const nodes=[];const edges=[];
    let idx=0;
    devicesMap.forEach((dev,id)=>{
      nodes.push({id:String(id),data:{label:dev.UnitId||id},position:{x:(idx%5)*150,y:Math.floor(idx/5)*80}});
      idx++;
    });
    devicesMap.forEach((dev,id)=>{
      if(dev.Connections){
        dev.Connections.forEach(c=>{
          if(devicesMap.has(c)){
            edges.push({id:`e${id}-${c}`,source:String(id),target:String(c)});
          }
        });
      }
    });
    setElements({nodes,edges});
  },[jsonData]);

  if(!jsonData) return <div>Load JSON to see topology</div>;

  return <div style={{width:'100%',height:'90vh'}}><ReactFlow nodes={elements.nodes} edges={elements.edges} fitView /></div>;
}

function DeviceListView(){
  const {excelData,jsonData} = useContext(DataContext);
  if(!excelData.length && !jsonData) return <div>Load files first</div>;
  const finalMap=new Map();
  if(jsonData){
    jsonData.changedDevicesStream.forEach(d=>finalMap.set(d.UnitId,d));
  }
  const matched=[];const excelOnly=[];const jsonOnly=[];
  excelData.forEach(row=>{
    if(row.UnitId && finalMap.has(row.UnitId)){
      matched.push({tag:row,scan:finalMap.get(row.UnitId)});
      finalMap.delete(row.UnitId);
    }else{
      excelOnly.push(row);
    }
  });
  finalMap.forEach(v=>jsonOnly.push(v));
  return (
    <div style={{display:'flex',gap:'10px'}}>
      <div><h3>Tag List</h3>{excelOnly.map((r,i)=><div key={i}>{r.TagName}</div>)}</div>
      <div><h3>Scanned</h3>{jsonOnly.map((d,i)=><div key={i}>{d.UnitId}</div>)}</div>
      <div><h3>Merged</h3>{matched.map((m,i)=><div key={i}>{m.tag.TagName} - {m.scan.UnitId}</div>)}</div>
    </div>
  );
}

function CEditorView(){
  return <div>Prototype C&E editor - drag DZ/AZ here</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
