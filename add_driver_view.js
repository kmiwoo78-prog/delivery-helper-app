const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const markerMainEnd = "</main>";
const idxMainEnd = content.indexOf(markerMainEnd);

if (idxMainEnd === -1) {
    console.error("Main End marker not found!");
    process.exit(1);
}

// Simple Driver Add View (reusing components if possible, or simple form)
// We'll use a simplified version of the input fields
const driverAddHTML = `
                    {/* ===== DRIVER ADD VIEW ===== */}
                    {view === 'driver_add' && (
                        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mt-4">
                            <h2 className="text-xl font-bold mb-4 text-indigo-900">배송지 직접 등록</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const newDelivery = {
                                    id: Date.now(),
                                    date: targetDate,
                                    address: formData.get('address'),
                                    contact: formData.get('contact'),
                                    memo: formData.get('memo'),
                                    install_fee: 0, // Default
                                    status: '접수',
                                    driver: currentUser,
                                    is_active: true
                                };
                                
                                // Add to deliveries
                                const updated = [...deliveries, newDelivery];
                                setDeliveries(updated);
                                StorageManager.saveDeliveries(updated);
                                // History management skipped for MVP if function not available
                                
                                alert('등록되었습니다.');
                                setView('driver');
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">주소</label>
                                    <input name="address" required placeholder="배송지 주소 입력" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">연락처</label>
                                    <input name="contact" placeholder="010-0000-0000" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">메모</label>
                                    <input name="memo" placeholder="요청사항 등" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setView('driver')} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                                        취소
                                    </button>
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">
                                        등록하기
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
`;

const newContent = content.substring(0, idxMainEnd) + driverAddHTML + content.substring(idxMainEnd);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully added driver_add view.");
