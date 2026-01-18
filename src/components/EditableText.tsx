import { useState, useContext } from 'react';
import { Edit3 } from 'lucide-react';
import { DataContext } from '../context/DataContext';

type Props = { 
  value: string; 
  contentKey?: string; 
  tag?: 'h1' | 'h2' | 'p' | 'span' | 'div';
  className?: string; 
  type?: 'text' | 'image' | 'textarea';
  onSave?: (value: string) => void;
};

export default function EditableText({ value, contentKey, onSave, tag = 'p', className = '', type = 'text' }: Props) {
  const { user, updateContent } = useContext(DataContext);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const isAdmin = user?.role === 'admin';

  const save = () => {
    if (onSave) {
      onSave(tempValue);
    } else if (contentKey) {
      updateContent({ [contentKey]: tempValue });
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative group z-50">
         {type === 'textarea' ? (
           <textarea 
             value={tempValue} 
             onChange={(e) => setTempValue(e.target.value)}
             className={`w-full p-2 bg-white border-2 border-lime-500 rounded shadow-lg outline-none min-h-[100px] text-slate-800 ${className}`}
             autoFocus
           />
         ) : (
           <input 
             value={tempValue} 
             onChange={(e) => setTempValue(e.target.value)}
             className={`w-full p-2 bg-white border-2 border-lime-500 rounded shadow-lg outline-none text-slate-800 ${className}`}
             autoFocus
             placeholder={type === 'image' ? "Enter image URL" : "Enter text"}
           />
         )}
         
         <div className="absolute top-full right-0 mt-2 z-10 flex gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-[#D4C4A8] text-[#3E2723] rounded text-xs font-bold hover:bg-[#C4B498]">Cancel</button>
            <button onClick={save} className="px-3 py-1 bg-lime-600 text-white rounded text-xs font-bold hover:bg-lime-700">Save</button>
         </div>
      </div>
    );
  }

  const Tag = tag as any;

  if (type === 'image') {
    return (
      <div className={`relative group w-full h-full ${isAdmin ? 'cursor-pointer' : ''}`}>
        <img src={value} alt="Content" className={className} />
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 p-2 bg-lime-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative group ${isAdmin ? 'cursor-pointer hover:bg-lime-50/50 rounded-lg -m-2 p-2 transition-colors' : ''}`}>
      <Tag className={className}>{value}</Tag>
      {isAdmin && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute -top-3 -right-3 p-1.5 bg-lime-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
