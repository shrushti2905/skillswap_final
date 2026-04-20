// Complete Requests Page Component with Tabs
const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('received');
    const [loading, setLoading] = useState(false);
    const [reviewModal, setReviewModal] = useState({ open: false, request: null });
    const [chatPanel, setChatPanel] = useState({ open: false, request: null });
    const { user } = window.SkillSwapComponents.useAuth();

    useEffect(() => {
        loadRequests();
    }, [activeTab]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const response = await window.apiClient.getRequests({ type: activeTab });
            setRequests(response.requests || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id, action) => {
        try {
            if (action === 'accept') {
                await window.apiClient.acceptRequest(id);
            } else if (action === 'reject') {
                await window.apiClient.rejectRequest(id);
            } else if (action === 'complete') {
                await window.apiClient.completeRequest(id);
            } else if (action === 'delete') {
                await window.apiClient.deleteRequest(id);
            }
            loadRequests();
        } catch (error) {
            alert('Failed to update request: ' + error.message);
        }
    };

    const handleUpdateMilestone = async (id, milestone) => {
        try {
            await window.apiClient.updateMilestone(id, milestone);
            loadRequests();
        } catch (e) {
            alert('Failed to update milestone: ' + e.message);
        }
    };

    const handleReviewSubmit = async (rating, text) => {
        try {
            const req = reviewModal.request;
            const partnerId = req.sender.id === user.id ? req.receiver.id : req.sender.id;
            await window.apiClient.addReview(partnerId, rating, text);
            setReviewModal({ open: false, request: null });
            alert('Review submitted successfully!');
        } catch (e) {
            alert('Failed to submit review: ' + e.message);
        }
    };

    const renderRequestCard = (request) => {
        const isSender = request.sender.id === user.id;
        const partner = isSender ? request.receiver : request.sender;

        return (
            <div key={request.id} className="bg-[#111827] border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                            {partner.first_name?.[0] || 'U'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{partner.first_name}</h3>
                            <p className="text-sm text-slate-400">{partner.location || 'Unknown'}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        request.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        request.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                        {request.status}
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-[#0b1220] rounded-xl border border-gray-700/50">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Offering</p>
                        <p className="text-green-400 font-medium">{request.skill_offered}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Requesting</p>
                        <p className="text-purple-400 font-medium">{request.skill_requested}</p>
                    </div>
                </div>

                {request.message && (
                    <p className="text-sm text-slate-300 mb-4 p-3 bg-[#0b1220] rounded-lg border border-gray-700/50">
                        "{request.message}"
                    </p>
                )}

                {request.milestone && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Current Milestone</p>
                        <p className="text-sm text-blue-300">{request.milestone}</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {request.status === 'pending' && !isSender && (
                        <>
                            <button
                                onClick={() => updateRequestStatus(request.id, 'accept')}
                                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium"
                            >
                                ✓ Accept
                            </button>
                            <button
                                onClick={() => updateRequestStatus(request.id, 'reject')}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                            >
                                ✕ Reject
                            </button>
                        </>
                    )}

                    {request.status === 'pending' && isSender && (
                        <button
                            onClick={() => updateRequestStatus(request.id, 'delete')}
                            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors font-medium"
                        >
                            ❌ Cancel Request
                        </button>
                    )}

                    {request.status === 'accepted' && (
                        <>
                            <button
                                onClick={() => setChatPanel({ open: true, request })}
                                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors font-medium"
                            >
                                💬 Chat
                            </button>
                            <button
                                onClick={() => {
                                    const milestone = prompt('Enter milestone:');
                                    if (milestone) handleUpdateMilestone(request.id, milestone);
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors font-medium"
                            >
                                📝 Update Milestone
                            </button>
                            {isSender && (
                                <button
                                    onClick={() => {
                                        updateRequestStatus(request.id, 'complete');
                                        setReviewModal({ open: true, request });
                                    }}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 transition-all font-medium shadow-lg shadow-purple-500/20"
                                >
                                    ✓ Mark Complete
                                </button>
                            )}
                        </>
                    )}
                </div>

                <p className="text-xs text-slate-500 mt-4">
                    {new Date(request.created_at).toLocaleDateString()}
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0b1220] py-8">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">My Swaps</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-[#111827] p-2 rounded-2xl border border-gray-700 w-fit">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                            activeTab === 'received'
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        📥 Received
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                            activeTab === 'sent'
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        📤 Sent
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                            activeTab === 'completed'
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        ✅ Completed
                    </button>
                </div>

                {/* Requests List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-[#111827] border border-gray-700 rounded-2xl">
                        <div className="text-7xl mb-6 opacity-50">📭</div>
                        <h3 className="text-2xl font-bold text-white mb-3">No requests found</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-6">
                            {activeTab === 'received' && "You haven't received any swap requests yet."}
                            {activeTab === 'sent' && "You haven't sent any swap requests yet."}
                            {activeTab === 'completed' && "You haven't completed any swaps yet."}
                        </p>
                        <a
                            href="#discover"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 font-medium shadow-lg shadow-purple-500/30"
                        >
                            Discover People
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {requests.map(renderRequestCard)}
                    </div>
                )}

                {/* Review Modal */}
                {reviewModal.open && reviewModal.request && (
                    <window.ReviewModal
                        isOpen={reviewModal.open}
                        onClose={() => setReviewModal({ open: false, request: null })}
                        partnerName={
                            reviewModal.request.sender.id === user.id
                                ? reviewModal.request.receiver.first_name
                                : reviewModal.request.sender.first_name
                        }
                        onSubmit={handleReviewSubmit}
                    />
                )}

                {/* Chat Panel */}
                {chatPanel.open && chatPanel.request && (
                    <window.ChatPanel
                        isOpen={chatPanel.open}
                        onClose={() => setChatPanel({ open: false, request: null })}
                        request={chatPanel.request}
                        currentUser={user}
                    />
                )}
            </div>
        </div>
    );
};

// Export
window.RequestsPage = RequestsPage;
