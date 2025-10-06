
import React, { useState } from 'react';
import { LayersIcon, PropertiesIcon, HistoryIcon, CommentsIcon } from './Icons';
import { LayersPanel } from './LayersPanel';

enum RightPanelTab {
    Layers, Properties, History, Comments
}

export const RightSidebar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<RightPanelTab>(RightPanelTab.Layers);

    return (
        <aside className="w-72 bg-[#1E1E1E] flex">
            <div className="flex-1 p-2 overflow-y-auto">
                {activeTab === RightPanelTab.Layers && <LayersPanel />}
                {activeTab === RightPanelTab.Properties && <div className="p-2">Properties Panel</div>}
                {activeTab === RightPanelTab.History && <div className="p-2">History Panel</div>}
                {activeTab === RightPanelTab.Comments && <div className="p-2">Comments Panel</div>}
            </div>
            <div className="w-10 bg-[#2f2f2f] flex flex-col items-center gap-2 p-1">
                 <button onClick={() => setActiveTab(RightPanelTab.Layers)} className={`p-2 rounded ${activeTab === RightPanelTab.Layers ? 'bg-gray-600' : ''}`}><LayersIcon/></button>
                 <button onClick={() => setActiveTab(RightPanelTab.Properties)} className={`p-2 rounded ${activeTab === RightPanelTab.Properties ? 'bg-gray-600' : ''}`}><PropertiesIcon/></button>
                 <button onClick={() => setActiveTab(RightPanelTab.History)} className={`p-2 rounded ${activeTab === RightPanelTab.History ? 'bg-gray-600' : ''}`}><HistoryIcon/></button>
                 <button onClick={() => setActiveTab(RightPanelTab.Comments)} className={`p-2 rounded ${activeTab === RightPanelTab.Comments ? 'bg-gray-600' : ''}`}><CommentsIcon/></button>
            </div>
        </aside>
    );
};
