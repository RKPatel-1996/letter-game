// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// A UI component for the settings dashboard. It displays a single
// learning item (letter/number) and provides buttons for the parent
// to set its learning status (struggling, not-practiced, learned).

import React, { FC } from 'react';
import { LearningItem, LearningStatus } from '../../types';
import { useLearningContext } from '../../context/LearningContext';

interface LearningItemRowProps {
  item: LearningItem;
}

const LearningItemRow: FC<LearningItemRowProps> = ({ item }) => {
  const { dispatch } = useLearningContext();

  const setStatus = (newStatus: LearningStatus) => {
    dispatch({
      type: "UPDATE_ITEM_STATUS",
      payload: { id: item.id, newStatus },
    });
  };

  const statusButtonClasses = (status: LearningStatus) => {
    const base =
      "w-10 h-10 flex items-center justify-center rounded-full font-bold text-xl transition-all";

    if (item.status === status) {
      const activeClasses = {
        struggling: "bg-red-500 text-white scale-110 shadow-lg",
        "not-practiced": "bg-blue-500 text-white scale-110 shadow-lg",
        learned: "bg-green-500 text-white scale-110 shadow-lg",
      }[status];
      return `${base} ${activeClasses}`;
    }
    
    return `${base} bg-gray-200 text-gray-500 hover:bg-gray-300`;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
      <span className="text-3xl font-bold text-gray-700 w-12 text-center">
        {item.value}
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStatus("struggling")}
          className={statusButtonClasses("struggling")}
        >
          ✖
        </button>
        <button
          onClick={() => setStatus("not-practiced")}
          className={statusButtonClasses("not-practiced")}
        >
          ?
        </button>
        <button
          onClick={() => setStatus("learned")}
          className={statusButtonClasses("learned")}
        >
          ✔
        </button>
      </div>
    </div>
  );
};

export default LearningItemRow;
