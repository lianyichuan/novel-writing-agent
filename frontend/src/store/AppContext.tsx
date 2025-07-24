import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { message } from 'antd';
import { AppState, Document, PlotLine, Character, WritingStats } from '../types';
import { documentAPI, plotAPI, characterAPI, writingAPI } from '../services/api';

// 初始状态
const initialState: AppState = {
  loading: false,
  error: null,
  documents: [],
  plots: [],
  characters: [],
  writingStats: null,
  currentDocument: null,
};

// Action类型
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'SET_PLOTS'; payload: PlotLine[] }
  | { type: 'SET_CHARACTERS'; payload: Character[] }
  | { type: 'SET_WRITING_STATS'; payload: WritingStats }
  | { type: 'SET_CURRENT_DOCUMENT'; payload: Document | null }
  | { type: 'UPDATE_DOCUMENT'; payload: Document };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'SET_PLOTS':
      return { ...state, plots: action.payload };
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload };
    case 'SET_WRITING_STATS':
      return { ...state, writingStats: action.payload };
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? action.payload : doc
        ),
        currentDocument: state.currentDocument?.id === action.payload.id 
          ? action.payload 
          : state.currentDocument
      };
    default:
      return state;
  }
};

// Context类型
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loadDocuments: () => Promise<void>;
    loadPlots: () => Promise<void>;
    loadCharacters: () => Promise<void>;
    loadWritingStats: () => Promise<void>;
    updateDocument: (id: string, content: string) => Promise<void>;
    setCurrentDocument: (document: Document | null) => void;
  };
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 加载文档
  const loadDocuments = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await documentAPI.getAllDocuments();
      if (response.data.success) {
        dispatch({ type: 'SET_DOCUMENTS', payload: response.data.data });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载文档失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      message.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 加载剧情
  const loadPlots = async () => {
    try {
      const response = await plotAPI.getAllPlots();
      if (response.data.success) {
        dispatch({ type: 'SET_PLOTS', payload: response.data.data });
      }
    } catch (error) {
      console.error('加载剧情失败:', error);
    }
  };

  // 加载人物
  const loadCharacters = async () => {
    try {
      const response = await characterAPI.getAllCharacters();
      if (response.data.success) {
        dispatch({ type: 'SET_CHARACTERS', payload: response.data.data });
      }
    } catch (error) {
      console.error('加载人物失败:', error);
    }
  };

  // 加载写作统计
  const loadWritingStats = async () => {
    try {
      const response = await writingAPI.getWritingStats();
      if (response.data.success) {
        dispatch({ type: 'SET_WRITING_STATS', payload: response.data.data });
      }
    } catch (error) {
      console.error('加载写作统计失败:', error);
    }
  };

  // 更新文档
  const updateDocument = async (id: string, content: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await documentAPI.updateDocument(id, content);
      if (response.data.success) {
        dispatch({ type: 'UPDATE_DOCUMENT', payload: response.data.data });
        message.success('文档保存成功');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存文档失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      message.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 设置当前文档
  const setCurrentDocument = (document: Document | null) => {
    dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: document });
  };

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadDocuments(),
        loadPlots(),
        loadCharacters(),
        loadWritingStats()
      ]);
    };

    initializeData();
  }, []);

  const actions = {
    loadDocuments,
    loadPlots,
    loadCharacters,
    loadWritingStats,
    updateDocument,
    setCurrentDocument,
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
