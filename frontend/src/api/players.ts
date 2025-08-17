// src/api/players.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getPlayers() {
  const res = await axios.get(`${API_BASE_URL}/players`);
  return res.data.data.players; // matches backend's response shape
}

export async function getPlayerById(playerId: string) {
  const res = await axios.get(`${API_BASE_URL}/players/${playerId}`);
  return res.data.data;
}

export async function createPlayer(playerData: any) {
  const res = await axios.post(`${API_BASE_URL}/players`, playerData);
  return res.data;
}

export async function updatePlayer(playerId: string, updates: any) {
  const res = await axios.put(`${API_BASE_URL}/players/${playerId}`, updates);
  return res.data;
}

export async function deletePlayer(playerId: string) {
  const res = await axios.delete(`${API_BASE_URL}/players/${playerId}`);
  return res.data;
}
