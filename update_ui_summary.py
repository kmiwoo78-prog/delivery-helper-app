
import os

file_path = r'd:\배달\deploy\index.html'

def update_file():
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    
    # Markers
    driver_view_marker = "{view === 'driver' && ("
    space_y_4_marker = '<div className="space-y-4">'
    list_area_marker = '<div className="space-y-6">'
    carousel_marker = '<div className="relative group">'
    
    # State flags
    inside_driver_view = False
    inserted_summary = False
    inside_list_area = False
    
    # Content to insert
    summary_html = """
                                {/* ===== TOP SUMMARY (FIXED ORDER) ===== */} 
                                <div className="pb-3"> 
                                
                                  {/* 1. 공지사항 */} 
                                  <div className="mx-3 mt-3 text-xs text-slate-500"> 
                                    📢 오늘은 비 오는 지역 배송 주의 
                                  </div> 
                                
                                  {/* 2. 날짜 */} 
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3 flex items-center justify-between"> 
                                    <span className="text-sm font-semibold"> 
                                      {targetDate} 
                                    </span> 
                                    <button className="text-lg">📅</button> 
                                  </div> 
                                
                                  {/* 3. 비용 합계 (심플) */} 
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3"> 
                                    <p className="text-xs text-slate-500">비용 합계</p> 
                                    <p className="text-xl font-bold mt-1">{totalInstallFeeOnly.toLocaleString()}원</p> 
                                  </div> 
                                
                                  {/* 4. 오늘 배송 현황 */} 
                                  <div className="mx-3 mt-4 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3 flex items-center justify-between"> 
                                
                                    <div> 
                                      <p className="text-sm font-bold">🚦 오늘 배송 현황</p> 
                                      <p className="text-xs text-slate-500 mt-1"> 
                                        완료 {deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.status === '완료').length}건 · 취소 {deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.canceled).length}건 
                                      </p> 
                                    </div> 
                                
                                    <button 
                                      onClick={() => setShowMap(!showMap)}
                                      className="px-4 py-2 rounded-xl 
                                                 bg-indigo-600 text-white 
                                                 text-sm font-bold"> 
                                      {showMap ? '지도 닫기' : '지도 보기'} 
                                    </button> 
                                  </div> 
                                
                                  {/* 5. 배송 목록 */} 
                                  <div className="mx-3 mt-4 mb-3 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3 flex items-center justify-between"> 
                                
                                    <div> 
                                        {!isMergeMode ? (
                                            <>
                                                <p className="text-sm font-bold">📦 배송 목록</p> 
                                                <p className="text-xs text-slate-500 mt-1"> 
                                                    미완료 {sortedDeliveries.length}건 
                                                </p> 
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-indigo-700">합칠 배송지를 선택하세요</p> 
                                                <p className="text-xs text-indigo-500 mt-1">{selectedMergeIds.length}건 선택됨</p> 
                                            </>
                                        )}
                                    </div> 
                                
                                    <div className="flex items-center gap-2"> 
                                      <button 
                                        onClick={toggleMergeMode}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium 
                                            ${isMergeMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}> 
                                        {isMergeMode ? '취소' : '합치기'} 
                                      </button> 
                                
                                      {isMergeMode && (
                                        <button 
                                            disabled={selectedMergeIds.length < 2} 
                                            onClick={handleMergeDeliveries} 
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedMergeIds.length < 2 ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white'}`}>
                                            하나로 ({selectedMergeIds.length})
                                        </button>
                                      )}

                                      {!isMergeMode && (
                                        <button 
                                            onClick={() => setView('driver_add')}
                                            className="w-10 h-10 rounded-full 
                                                       bg-indigo-600 text-white 
                                                       text-xl flex items-center justify-center"> 
                                            + 
                                        </button> 
                                      )}
                                    </div> 
                                  </div> 
                                
                                </div>
    """

    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check for Driver View start
        if driver_view_marker in line:
            inside_driver_view = True
            new_lines.append(line)
            i += 1
            continue
            
        # Check for space-y-4 to insert Summary
        if inside_driver_view and space_y_4_marker in line and not inserted_summary:
            new_lines.append(line) # Add the space-y-4 line
            new_lines.append(summary_html + "\n") # Insert Summary
            inserted_summary = True
            i += 1
            continue
            
        # Check for List Area start
        if inside_driver_view and list_area_marker in line:
            inside_list_area = True
            new_lines.append(line)
            i += 1
            continue
            
        # Handle content inside List Area (Delete old cards)
        if inside_list_area:
            if carousel_marker in line:
                # Found carousel, stop deleting
                inside_list_area = False
                new_lines.append(line)
            else:
                # Skip lines (delete) until carousel
                pass
            i += 1
            continue
            
        # Default: keep line
        new_lines.append(line)
        i += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print("Successfully updated UI with new Top Summary")

if __name__ == "__main__":
    update_file()
