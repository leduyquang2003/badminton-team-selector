import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, User, Calendar, Hand, Target, Trophy } from 'lucide-react';
import { ELO_CONSTANTS, Hand as HandType, Specialty, SkillLevel, RacketInfo, Player } from '../types';

interface AddPlayerFormProps {
  onAddPlayer: (newPlayerData: Omit<Player, "_id" | "playerId" | "createdAt" | "updatedAt" | "lastActiveAt">) => Promise<void>;
  existingPlayers: Player[];
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, existingPlayers }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(25);
  const [hand, setHand] = useState<HandType>(HandType.RIGHT);
  const [specialty, setSpecialty] = useState<Specialty>(Specialty.DOUBLES);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.BEGINNER);
  const [racket, setRacket] = useState<RacketInfo>({
    brand: '',
    model: '',
    weight: '',
    tension: '',
    string: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Generate unique email if not provided
    const playerEmail = email.trim() || `player_${Date.now()}@badminton.local`;

    const newPlayerData = {
      name,
      email: playerEmail, // Use generated email if empty
      age,
      hand,
      specialty,
      skillLevel,
      currentElo: ELO_CONSTANTS.INITIAL_RATING,
      peakElo: ELO_CONSTANTS.INITIAL_RATING,
      initialElo: ELO_CONSTANTS.INITIAL_RATING,
      racket,
      stats: {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        currentWinStreak: 0,
        longestWinStreak: 0,
        averageScoreFor: 0,
        averageScoreAgainst: 0,
        recentFormWinRate: 0
      },
      winRate: 0,
      gamesPlayed: 0,
      matchHistory: [],
      frequentPartners: [],
      currentRank: 999999,
      previousRank: 999999,
      rankChange: 0,
      avatar: '🏸',
      color: '#4ECDC4',
      preferredPlayTimes: [],
      availableDays: []
    };

    try {
      setLoading(true);
      await onAddPlayer(newPlayerData);
      setSuccess(true);
      
      // Reset form
      setName('');
      setEmail('');
      setAge(25);
      setRacket({ brand: '', model: '', weight: '', tension: '', string: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add player');
    } finally {
      setLoading(false);
    }
  };

  // Styled components
  const FormContainer = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const InputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e1e5e9',
    borderRadius: '12px',
    fontSize: '1rem',
    background: 'white',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  const InputFocusStyle = {
    ...InputStyle,
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
  };

  const SelectStyle = {
    ...InputStyle,
    cursor: 'pointer'
  };

  const ButtonStyle = {
    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
  };

  const LabelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.9rem'
  };

  const SectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    marginTop: '1.5rem',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#667eea'
  };

  return (
    <motion.div
      style={FormContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <UserPlus size={28} color="#667eea" />
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
          Add New Player
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={LabelStyle}>
              <User size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Player Name *
            </label>
            <input
              type="text"
              placeholder="Enter player name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
              required
            />
          </div>

          <div>
            <label style={LabelStyle}>
              <Mail size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Email (Optional)
            </label>
            <input
              type="email"
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
            />
          </div>

          <div>
            <label style={LabelStyle}>
              <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Age *
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 25)}
              min="8"
              max="80"
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
              required
            />
          </div>
        </div>

        {/* Player Preferences */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={LabelStyle}>
              <Hand size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Dominant Hand
            </label>
            <select 
              value={hand} 
              onChange={(e) => setHand(e.target.value as HandType)} 
              style={SelectStyle}
            >
              {Object.values(HandType).map((h) => (
                <option key={h} value={h}>
                  {h.charAt(0) + h.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={LabelStyle}>
              <Target size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Specialty
            </label>
            <select 
              value={specialty} 
              onChange={(e) => setSpecialty(e.target.value as Specialty)} 
              style={SelectStyle}
            >
              {Object.values(Specialty).map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={LabelStyle}>
              <Trophy size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Skill Level
            </label>
            <select 
              value={skillLevel} 
              onChange={(e) => setSkillLevel(e.target.value as SkillLevel)} 
              style={SelectStyle}
            >
              {Object.values(SkillLevel).map((sl) => (
                <option key={sl} value={sl}>
                  {sl.charAt(0) + sl.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Racket Information */}
        <div style={SectionHeaderStyle}>
          🏸 Racket Information (Optional)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={LabelStyle}>Brand</label>
            <input
              type="text"
              placeholder="e.g., Yonex, Victor, Li-Ning"
              value={racket.brand}
              onChange={(e) => setRacket({ ...racket, brand: e.target.value })}
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
            />
          </div>

          <div>
            <label style={LabelStyle}>Model</label>
            <input
              type="text"
              placeholder="e.g., Arcsaber 11, Thruster K9900"
              value={racket.model}
              onChange={(e) => setRacket({ ...racket, model: e.target.value })}
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={LabelStyle}>Weight</label>
            <input
              type="text"
              placeholder="e.g., 85g, 4U"
              value={racket.weight}
              onChange={(e) => setRacket({ ...racket, weight: e.target.value })}
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
            />
          </div>

          <div>
            <label style={LabelStyle}>String Tension</label>
            <input
              type="text"
              placeholder="e.g., 24lbs, 11kg"
              value={racket.tension}
              onChange={(e) => setRacket({ ...racket, tension: e.target.value })}
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
            />
          </div>

          <div>
            <label style={LabelStyle}>String Type</label>
            <input
              type="text"
              placeholder="e.g., BG80, Aerobite"
              value={racket.string}
              onChange={(e) => setRacket({ ...racket, string: e.target.value })}
              style={InputStyle}
              onFocus={(e) => Object.assign(e.target.style, InputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, InputStyle)}
            />
          </div>
        </div>

        {/* Submit Button and Messages */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.button
            type="submit"
            disabled={loading}
            style={ButtonStyle}
            whileHover={loading ? {} : { scale: 1.02 }}
            whileTap={loading ? {} : { scale: 0.98 }}
          >
            <UserPlus size={18} />
            {loading ? 'Adding Player...' : 'Add Player'}
          </motion.button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ 
                  color: '#ef4444', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                ❌ {error}
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ 
                  color: '#10b981', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                ✅ Player added successfully!
              </motion.div>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: 'rgba(102, 126, 234, 0.05)', 
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#6b7280'
        }}>
          <strong>💡 Tip:</strong> If you don't provide an email, we'll generate a unique one automatically. 
          All racket information is required for proper ELO calculations and matchmaking.
        </div>
      </form>
    </motion.div>
  );
};

export default AddPlayerForm;