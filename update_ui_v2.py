
import os

file_path = r'd:\배달\deploy\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_line_idx = -1
target_str = 'className="mx-3 mb-3 flex items-center justify-end gap-2"'

for i, line in enumerate(lines):
    if target_str in line:
        start_line_idx = i
        break

if start_line_idx != -1:
    # We found the div line.
    # The comment is likely the line before.
    comment_idx = start_line_idx - 1
    
    # We want to find the closing div.
    # It is likely indented similarly.
    # Let's just assume the block ends before "Sortable List Container"
    end_line_idx = -1
    for j in range(start_line_idx, len(lines)):
        if "Sortable List Container" in lines[j]:
            end_line_idx = j - 1 # The line before the comment
            break
            
    # Refine end_line_idx: strip empty lines before "Sortable List Container"
    while end_line_idx > start_line_idx and lines[end_line_idx].strip() == "":
        end_line_idx -= 1
        
    # Now end_line_idx should be the </div> line?
    # Let's print to debug (writing to a log file since stdout is hidden)
    with open('d:\\배달\\deploy\\debug_log.txt', 'w', encoding='utf-8') as log:
        log.write(f"Found start at {start_line_idx}\n")
        log.write(f"Found end candidate at {end_line_idx}\n")
        log.write(f"Start content: {lines[start_line_idx]}")
        log.write(f"End content: {lines[end_line_idx]}")
        
    # New content
    new_content = """                                {/* 합치기 / 배송 목록 카드 */}
                                <div 
                                    className=" 
                                        mx-3 mt-4 
                                        rounded-2xl bg-white 
                                        shadow-sm border 
                                        px-4 py-3 min-h-[92px] 
                                        flex items-center justify-between 
                                    " 
                                > 
                                    {/* 좌측 텍스트 영역 */} 
                                    <div className="flex flex-col justify-center gap-1"> 
                                        {!isMergeMode ? (
                                            <>
                                                <p className="text-sm font-bold text-slate-900 leading-tight"> 
                                                    📦 배송 목록 
                                                </p> 
                                                <p className="text-xs text-slate-500 leading-tight"> 
                                                    오늘 예약된 배송 {sortedDeliveries.length}건 
                                                </p> 
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-indigo-700 leading-tight"> 
                                                    합칠 배송지를 선택하세요 
                                                </p> 
                                                <p className="text-xs text-indigo-500 leading-tight"> 
                                                    {selectedMergeIds.length}건 선택됨 
                                                </p> 
                                            </>
                                        )}
                                    </div> 

                                    {/* 우측 액션 버튼 영역 */} 
                                    <div className="flex items-center gap-2 flex-shrink-0"> 
                                        {/* 합치기 / 취소 버튼 */}
                                        <button 
                                            onClick={toggleMergeMode} 
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap 
                                                ${isMergeMode 
                                                    ? 'bg-slate-800 text-white' 
                                                    : 'bg-slate-100 text-slate-600'} 
                                            `} 
                                        > 
                                            {isMergeMode ? '취소' : '합치기'} 
                                        </button> 

                                        {/* 합치기 실행 버튼 (합치기 모드일 때만) */}
                                        {isMergeMode && (
                                            <button 
                                                disabled={selectedMergeIds.length < 2} 
                                                onClick={handleMergeDeliveries} 
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold 
                                                    ${selectedMergeIds.length < 2 
                                                        ? 'bg-slate-200 text-slate-400' 
                                                        : 'bg-indigo-600 text-white'} 
                                                `} 
                                            > 
                                                하나로 ({selectedMergeIds.length})
                                            </button> 
                                        )}

                                        {/* 배송지 추가 (일반 모드일 때만) */}
                                        {!isMergeMode && (
                                            <button 
                                                onClick={() => setView('driver_add')} 
                                                className=" 
                                                    w-10 h-10 
                                                    rounded-full 
                                                    bg-indigo-600 text-white 
                                                    text-xl leading-none 
                                                    flex items-center justify-center 
                                                    flex-shrink-0 
                                                " 
                                                aria-label="배송지 추가" 
                                            > 
                                                + 
                                            </button> 
                                        )}
                                    </div> 
                                </div>
"""
    # Replace from comment_idx to end_line_idx (inclusive)
    lines[comment_idx : end_line_idx+1] = [new_content + "\n"]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
else:
    with open('d:\\배달\\deploy\\debug_log.txt', 'w', encoding='utf-8') as log:
        log.write("Target string not found.")

