
const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// 1. Add state
const stateMarker = 'const [selectedMergeIds, setSelectedMergeIds] = useState([]);';
let stateIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(stateMarker)) {
        stateIdx = i;
        break;
    }
}

if (stateIdx !== -1) {
    if (!content.includes('const [isCostOpen, setIsCostOpen]')) {
        lines.splice(stateIdx + 1, 0, '            const [isCostOpen, setIsCostOpen] = useState(false);');
        console.log('Added isCostOpen state');
    } else {
        console.log('isCostOpen state already exists');
    }
} else {
    console.log('State marker not found');
}

// 2. Add Cost Summary Card
const listMarker = '{/* Sortable List Container';
let listIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(listMarker)) {
        listIdx = i;
        break;
    }
}

if (listIdx !== -1) {
    let alreadyExists = false;
    // Check previous 50 lines to be safe
    for (let i = Math.max(0, listIdx - 50); i < listIdx; i++) {
        if (lines[i] && lines[i].includes('비용 합계')) {
            alreadyExists = true;
            break;
        }
    }

    if (!alreadyExists) {
        const cardContent = `
                                {/* 비용 합계 카드 (접기/펼치기) */}
                                <div 
                                    className=" 
                                        mx-3 mt-3 mb-3
                                        rounded-2xl bg-white 
                                        border shadow-sm 
                                        px-4 py-3 min-h-[72px] 
                                        flex items-center justify-between 
                                    " 
                                > 
                                    {/* 좌측 */} 
                                    <div className="flex flex-col justify-center gap-0.5"> 
                                        <p className="text-xs text-slate-500"> 
                                            비용 합계 
                                        </p> 
                                        <p className="text-lg font-bold text-slate-900"> 
                                            {totalInstallFeeOnly.toLocaleString()}원 
                                        </p> 
                                    </div> 
                                
                                    {/* 우측: 접기 */} 
                                    <button 
                                        onClick={() => setIsCostOpen(!isCostOpen)} 
                                        className="text-slate-400 hover:text-slate-600 transition" 
                                        aria-label="비용 상세 열기" 
                                    > 
                                        {isCostOpen ? '▴' : '▾'} 
                                    </button> 
                                </div>

                                {/* 비용 상세 내용 (펼쳐졌을 때) */}
                                {isCostOpen && (
                                    <div className="mx-3 mb-3 px-4 py-3 bg-slate-50 rounded-xl text-sm space-y-2 border border-slate-100">
                                        <div className="flex justify-between text-slate-600">
                                            <span>기본 설치비</span>
                                            <span className="font-bold">
                                                {(totalInstallFeeOnly - extraFeesTotal).toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>추가 비용 (양중/내림/기타)</span>
                                            <span className="font-bold text-indigo-600">
                                                {extraFeesTotal.toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                                            <span>총 합계</span>
                                            <span>{totalInstallFeeOnly.toLocaleString()}원</span>
                                        </div>
                                    </div>
                                )}`;
        lines.splice(listIdx, 0, cardContent);
        console.log('Added Cost Summary card');
    } else {
        console.log('Cost Summary card already exists');
    }
} else {
    console.log('List marker not found');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated index.html with Cost Summary');
