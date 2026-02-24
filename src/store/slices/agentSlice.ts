import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from './agentsApiSlice';

interface AgentState {
  agent: Agent | null;
}

const initialState: AgentState = {
  agent: null,
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setAgent: (state, action: PayloadAction<Agent | null>) => {
      state.agent = action.payload;
    },
    clearAgent: (state) => {
      state.agent = null;
    },
  },
});

export const { setAgent, clearAgent } = agentSlice.actions;
export default agentSlice.reducer;
