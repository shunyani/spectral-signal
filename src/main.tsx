import { Devvit, useState, useAsync, useInterval, useForm } from '@devvit/public-api';

Devvit.configure({ redditAPI: true, redis: true });

// ---------------------
//  HELPER COMPONENTS
// ---------------------

const MenuCard = ({ title, desc, color, onPress }: any) => (
  <vstack 
    cornerRadius="medium" 
    borderColor={color} 
    border="thin" 
    padding="small" 
    backgroundColor="#1a1a1a" 
    gap="small" 
    onPress={onPress}
  >
    <vstack alignment="center">
      <text size="medium" weight="bold" color={color}>{title}</text>
      <text size="xsmall" color="white">{desc}</text>
    </vstack>
    <hstack backgroundColor={color} cornerRadius="full" alignment="middle center" padding="xsmall">
      <text size="xsmall" weight="bold" color="black">INITIATE ➜</text>
    </hstack>
  </vstack>
);

const RealFooter = ({ count, onLeaderboard }: any) => (
  <hstack width="100%" alignment="middle" padding="small">
    <vstack backgroundColor="#1a1a1a" cornerRadius="medium" padding="small" borderColor="#00ffcc" border="thin" width="120px">
      <text size="xsmall" color="#00ffcc" weight="bold">● AGENTS TODAY</text>
      <text size="large" weight="bold" color="white">{count ? count.toLocaleString() : "..."}</text>
    </vstack>
    <spacer grow />
    <vstack backgroundColor="#1a1a1a" cornerRadius="medium" padding="small" borderColor="#FFD700" border="thin" alignment="center" width="120px" onPress={onLeaderboard}>
      <text size="large">🏆</text>
      <text size="xsmall" weight="bold" color="#FFD700">RANKINGS</text>
    </vstack>
  </hstack>
);

// -------------
//  LB SCREEN
// -------------

const LeaderboardScreen = ({ context, onBack }: any) => {
  const [activeTab, setActiveTab] = useState<'scout' | 'ranger' | 'elite' | 'streaks'>('scout');
  const today = new Date().toISOString().split('T')[0];
  const y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
  const yesterday = y.toISOString().split('T')[0];
  
  const { data, loading } = useAsync(async () => {
    const currentUser = await context.reddit.getCurrentUser();
    
    const [scout, ranger, elite, streaksRaw] = await Promise.all([
      context.redis.zRange(`leaderboard_easy_${today}`, 0, 9, { by: 'score' }), 
      context.redis.zRange(`leaderboard_medium_${today}`, 0, 9, { by: 'score' }),
      context.redis.zRange(`leaderboard_hard_${today}`, 0, 9, { by: 'score' }),
      context.redis.zRange(`leaderboard_streaks`, 0, 19, { by: 'score', reverse: true }) 
    ]);

    const streakDates = await Promise.all(
        streaksRaw.map((item: any) => context.redis.get(`streak_date_${item.member}`))
    );

    const validStreaks = streaksRaw.filter((_: any, index: number) => {
        const d = streakDates[index];
        return d === today || d === yesterday;
    }).slice(0, 10);

    return { scout, ranger, elite, streaks: validStreaks, username: currentUser?.username };
  });

  const getThemeColor = () => {
    switch (activeTab) {
      case 'scout': return '#00ffcc';
      case 'ranger': return '#9900ff';
      case 'elite': return '#ff0055';
      case 'streaks': return '#FFD700';
      default: return '#ffffff';
    }
  };

  const themeColor = getThemeColor();

  const renderRankBadge = (index: number) => {
    let bgColor = "#333333"; let textColor = "white";
    if (index === 0) { bgColor = "#FFD700"; textColor = "black"; } 
    else if (index === 1) { bgColor = "#C0C0C0"; textColor = "black"; } 
    else if (index === 2) { bgColor = "#CD7F32"; textColor = "black"; } 
    return (<vstack width="24px" height="24px" cornerRadius="full" backgroundColor={bgColor} alignment="center middle"><text size="small" weight="bold" color={textColor}>{(index + 1).toString()}</text></vstack>);
  };

  const TabButton = ({ label, mode, color }: any) => {
    const isActive = activeTab === mode;
    return (
      <vstack grow onPress={() => setActiveTab(mode)} backgroundColor={isActive ? color : "#1a1a1a"} cornerRadius="full" padding="xsmall" alignment="center middle" borderColor={isActive ? "transparent" : color} border={isActive ? "none" : "thin"}>
        <text size="xsmall" weight="bold" color={isActive ? "black" : "white"}>{label}</text>
      </vstack>
    );
  };

  const renderList = (list: any[]) => (
    <vstack width="100%" backgroundColor="#000000" cornerRadius="medium" border="thin" borderColor={themeColor} padding="medium" gap="small">
       <hstack alignment="middle"><text color={themeColor} weight="bold" size="medium">{activeTab.toUpperCase()} RANKINGS</text><spacer grow /><text color="#666" size="xsmall">TOP 10</text></hstack>
       <vstack width="100%" height="1px" backgroundColor={themeColor} /><spacer height="4px"/>
       {list && list.length > 0 ? (
         <vstack gap="small" width="100%">
           {list.map((e: any, i: number) => {
             const isMe = e.member === data?.username;
             return (
               <hstack key={i.toString()} width="100%" alignment="middle" backgroundColor={isMe ? "#1a1a1a" : "transparent"} cornerRadius="small" padding="xsmall">
                  {renderRankBadge(i)}<spacer width="12px" /> 
                  <text color={isMe ? themeColor : "white"} size="medium" weight="bold" overflow="ellipsis">{e.member}</text>
                  <spacer grow />
                  <vstack alignment="end"><text color={themeColor} weight="bold" size="medium">{Math.floor(e.score)}</text><text color="#666" size="xsmall">{activeTab === 'streaks' ? 'DAYS' : 'MOVES'}</text></vstack>
               </hstack>
             );
           })}
         </vstack>
       ) : (<vstack alignment="center" padding="large"><text color="#666" size="medium">NO DATA YET</text></vstack>)}
    </vstack>
  );

  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <image url="background2.jpg" imageWidth={1080} imageHeight={1920} width="100%" height="100%" resizeMode="cover" />
      <vstack width="100%" height="100%" padding="small" alignment="top center" gap="small">
        <hstack width="100%" alignment="middle"><button size="small" appearance="secondary" onPress={onBack}>BACK</button><spacer grow /><text size="large" weight="bold" color={themeColor}>TERMINAL LOGS</text><spacer grow /><spacer width="40px" /></hstack>
        <hstack width="100%" gap="small" padding="xsmall"><TabButton label="SCOUT" mode="scout" color="#00ffcc" /><TabButton label="RANGER" mode="ranger" color="#9900ff" /><TabButton label="ELITE" mode="elite" color="#ff0055" /><TabButton label="STREAK" mode="streaks" color="#FFD700" /></hstack>
        <vstack width="100%" height="420px">{loading ? <vstack grow alignment="center middle"><text color={themeColor}>SYNCING...</text></vstack> : renderList(data?.[activeTab])}</vstack>
      </vstack>
    </zstack>
  );
};

// --------------
//  GAME LOGIC
// --------------

const GameController = ({ mode, context, onBack }: any) => {
  const getUtcDate = (d: Date) => d.toISOString().split('T')[0];
  const today = getUtcDate(new Date());
  
  const gridSize = mode === 'easy' ? 6 : 8;
  const tileSize = gridSize === 6 ? "38px" : "28px";
  
  const [attempts, setAttempts] = useState(0);
  const [scannedTiles, setScannedTiles] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shake, setShake] = useState(0); 
  const [streak, setStreak] = useState({ current: 0, lastWin: '' });
  const [isCreating, setIsCreating] = useState(false); 
  const [totalContracts, setTotalContracts] = useState(0); 

  const [creatorGhostIndex, setCreatorGhostIndex] = useState(-1);
  const [customMoves, setCustomMoves] = useState(7); 
  const [customMines, setCustomMines] = useState(11); 

  useInterval(() => { if (shake > 0) setShake(prev => prev - 1); }, 50);


  const { data, loading } = useAsync(async () => {
    const user = await context.reddit.getCurrentUser();
    const username = user?.username ?? 'Agent';
    
    let gameData = null;
    let isCustom = false;
    let customTitle = "";
    let moveLimit = 7;

    const customDataString = await context.redis.get(`puzzle:${context.postId}`);
    
    if (customDataString) {
        isCustom = true;
        const cData = JSON.parse(customDataString);
        const gx = cData.ghostIndex % gridSize;
        const gy = Math.floor(cData.ghostIndex / gridSize);
        moveLimit = cData.moves || 7;
        
        let bombs: any[] = [];
        if (mode === 'hard') {
           const count = cData.mineCount || 11;
           while(bombs.length < count) {
              const bx = Math.floor(Math.random() * gridSize);
              const by = Math.floor(Math.random() * gridSize);
              if((bx !== gx || by !== gy) && !bombs.some((b: any) => b.x === bx && b.y === by)) { 
                  bombs.push({x: bx, y: by}); 
              }
           }
        }
        gameData = { ghost: { x: gx, y: gy }, bombs };
        customTitle = cData.author;
    } else {
        const ghostKey = `ghost_${mode}_${today}`;
        let gameDataString = await context.redis.get(ghostKey);
        gameData = gameDataString ? JSON.parse(gameDataString) : null;

        if (!gameData || !gameData.ghost) {
            const gx = Math.floor(Math.random() * gridSize);
            const gy = Math.floor(Math.random() * gridSize);
            const bombs: any[] = [];
            if (mode === 'hard') {
                while(bombs.length < 11) {
                    const bx = Math.floor(Math.random() * gridSize);
                    const by = Math.floor(Math.random() * gridSize);
                    if((bx !== gx || by !== gy) && !bombs.some((b: any) => b.x === bx && b.y === by)) { bombs.push({x: bx, y: by}); }
                }
            }
            gameData = { ghost: { x: gx, y: gy }, bombs };
            await context.redis.set(ghostKey, JSON.stringify(gameData));
        }
    }

    const progressKey = isCustom 
        ? `progress_custom_${context.postId}_${context.userId}`
        : `progress_${mode}_${today}_${context.userId}_v13`;

    const savedProgress = await context.redis.get(progressKey).then((res: string | undefined) => res ? JSON.parse(res) : null);
    
    const streakKey = `streak_${context.userId}`;
    let s = await context.redis.get(streakKey).then((res: string | undefined) => res ? JSON.parse(res) : { current: 0, lastWin: '' });

    const contracts = await context.redis.get(`contracts_solved_${context.userId}`).then((res: string | undefined) => res ? parseInt(res) : 0);
    
    const y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
    const yesterday = y.toISOString().split('T')[0];
    if (s.current > 0 && s.lastWin !== today && s.lastWin !== yesterday) {
        s.current = 0; 
        await context.redis.set(streakKey, JSON.stringify(s));
    }
    
    const alreadyUploaded = savedProgress?.submitted || false;
    if (alreadyUploaded) setSubmitted(true);

    return { 
      gameData, username, alreadyUploaded, 
      savedAttempts: savedProgress?.attempts ?? 0,
      savedTiles: savedProgress?.scannedTiles ?? {},
      savedGameOver: alreadyUploaded || (savedProgress?.gameOver ?? false),
      savedDead: savedProgress?.dead ?? false,
      savedStreak: s,
      isCustom, customTitle, moveLimit,
      progressKey, contracts
    };
  });

  const [loaded, setLoaded] = useState(false);
  if (data && !loaded) {
      setAttempts(data.savedAttempts);
      setScannedTiles(data.savedTiles);
      setGameOver(data.savedGameOver);
      setIsDead(data.savedDead);
      setStreak(data.savedStreak);
      setTotalContracts(data.contracts);
      setLoaded(true);
  }

  const RANGER_LIMIT = data?.moveLimit || 7;

  const handleCreatorTap = (index: number) => {
    setCreatorGhostIndex(index);
  };

  const postChallenge = async () => {
    if (creatorGhostIndex === -1) { context.ui.showToast("Select a ghost location first!"); return; }
    
    context.ui.showToast("Creating Challenge...");
    
    const modeName = mode === 'easy' ? 'SCOUT' : mode === 'medium' ? 'RANGER' : 'ELITE';
    let title = `Can you find u/${data?.username}'s Ghost? [${modeName}]`;
    if(mode === 'medium') title = `Can you find u/${data?.username}'s Ghost in ${customMoves} moves?`;
    if(mode === 'hard') title = `Can you survive u/${data?.username}'s ${customMines}-Mine Trap?`;

    const newPost = await context.reddit.submitPost({
        title: title,
        subredditName: (await context.reddit.getCurrentSubreddit()).name,
        preview: (<vstack height="100%" width="100%" alignment="middle center" backgroundColor="#000510"><text size="large" color="#00ffcc">LOADING USER PUZZLE...</text></vstack>),
    });

    await context.redis.set(`puzzle:${newPost.id}`, JSON.stringify({
        ghostIndex: creatorGhostIndex,
        mode: mode,
        author: data?.username,
        moves: customMoves,
        mineCount: customMines,
        createdAt: Date.now()
    }));

    context.ui.showToast("Challenge Posted! Check New.");
    setIsCreating(false);
  };

  const rechargeSystem = async () => {
      setAttempts(0); setScannedTiles({}); setIsDead(false); setGameOver(false);
      setSubmitted(false); setShake(0);
      if (data?.progressKey) await context.redis.del(data.progressKey);
      context.ui.showToast("SYSTEM RECHARGED");
  };

  const submitScore = async () => {
      if (submitted || !data) return;

      if (data.isCustom) {
          const newTotal = totalContracts + 1;
          await context.redis.incrBy(`contracts_solved_${context.userId}`, 1);
          setTotalContracts(newTotal);
          setSubmitted(true);
          
          if (data.progressKey) {
             const current = await context.redis.get(data.progressKey);
             if (current) {
                 const parsed = JSON.parse(current);
                 parsed.submitted = true;
                 await context.redis.set(data.progressKey, JSON.stringify(parsed));
             }
          }
          context.ui.showToast(`BOUNTY CLAIMED. TOTAL: ${newTotal}`);
          return;
      }
      
      const d = new Date(); d.setUTCDate(d.getUTCDate() - 1);
      const yesterdayStr = d.toISOString().split('T')[0];
      const trueStreak = await context.redis.get(`streak_${context.userId}`).then((res: string | undefined) => res ? JSON.parse(res) : { current: 0, lastWin: '' });

      let newStreakCount = 1;
      if (trueStreak.lastWin === yesterdayStr) newStreakCount = trueStreak.current + 1;
      else if (trueStreak.lastWin === today) newStreakCount = trueStreak.current; 
      
      const newS = { current: newStreakCount, lastWin: today };
      await context.redis.set(`streak_${context.userId}`, JSON.stringify(newS));
      setStreak(newS); 

      await context.redis.zAdd(`leaderboard_streaks`, { member: data?.username ?? 'Agent', score: newStreakCount });
      await context.redis.zAdd(`leaderboard_${mode === 'easy' ? 'easy' : mode === 'medium' ? 'medium' : 'hard'}_${today}`, { member: data?.username ?? 'Agent', score: attempts });
      await context.redis.set(`streak_date_${data?.username}`, today);

      setSubmitted(true);
      
      if (data.progressKey) {
          const current = await context.redis.get(data.progressKey);
          if (current) {
              const parsed = JSON.parse(current);
              parsed.submitted = true;
              await context.redis.set(data.progressKey, JSON.stringify(parsed));
          }
      }

      context.ui.showToast(`SCORE UPLOADED. STREAK: ${newStreakCount}`);
  };

  const handleScan = async (x: number, y: number) => {
    if (isCreating) {
        const index = y * gridSize + x;
        handleCreatorTap(index);
        return;
    }

    if (!data || !data?.gameData || !data?.gameData?.ghost) { context.ui.showToast("ERROR: SYNCING... TRY AGAIN"); return; }
    if (gameOver || isDead || submitted || scannedTiles[`${x}-${y}`] !== undefined) return;
    
    try {
        const { ghost, bombs } = data.gameData;
        const hitBomb = bombs ? bombs.some((b: any) => b.x === x && b.y === y) : false;
        const dist = Math.sqrt(Math.pow(ghost.x - x, 2) + Math.pow(ghost.y - y, 2));
        let signal = hitBomb ? -1 : Math.floor(Math.max(0, 100 - (dist * 9)));
        
        const newTiles = { ...scannedTiles, [`${x}-${y}`]: signal };
        const newAttempts = attempts + 1;
        const winNow = signal === 100;

        setScannedTiles(newTiles); setAttempts(newAttempts);

        if (winNow) {
            setGameOver(true);
        } else if (hitBomb || (mode === 'medium' && newAttempts >= RANGER_LIMIT)) { 
            setIsDead(true); 
            setShake(8); 
        }

        if (data.progressKey) {
            await context.redis.set(data.progressKey, JSON.stringify({
                attempts: newAttempts, scannedTiles: newTiles, gameOver: winNow, 
                dead: hitBomb || (mode === 'medium' && newAttempts >= RANGER_LIMIT), submitted: submitted
            }));
        }
    } catch (e) { context.ui.showToast("SYSTEM ERROR: RESTART APP"); }
  };

  if(loading || !data) return <vstack height="100%" alignment="center middle"><text color="#00ffcc">DECRYPTING...</text></vstack>;
  const shakePad = shake % 2 === 0 ? "small" : "medium";
  const displayStreak = data?.savedStreak?.current ?? streak.current;

  if (isCreating) {
    return (
        <zstack width="100%" height="100%" alignment="center middle">
            <image url="background.jpg" imageWidth={1080} imageHeight={1920} width="100%" height="100%" resizeMode="cover" />
            <vstack width="100%" height="100%" backgroundColor="#000000D9" padding="medium" alignment="center middle" gap="medium">
                <text size="large" weight="bold" color="#00ffcc">CREATE CHALLENGE</text>
                <text size="small" color="white">Tap grid to hide the Ghost</text>
                
                <vstack padding="small" backgroundColor="#000000" cornerRadius="large" border="thin" borderColor="#00ffcc" gap="small">
                    {[...Array(gridSize)].map((_, r) => (
                      <hstack key={r.toString()} gap="small" alignment="center middle">
                        {[...Array(gridSize)].map((_, c) => {
                          const index = r * gridSize + c;
                          const isSelected = creatorGhostIndex === index;
                          return (
                            <vstack key={c.toString()} width={tileSize} height={tileSize} 
                                backgroundColor={isSelected ? "#00ffcc" : "#0a1520"} 
                                onPress={() => handleScan(c, r)} 
                                alignment="center middle" cornerRadius="small" borderColor="#ffffff33" border="thin">
                                {isSelected && <image url="goodghost.jpg" imageWidth={256} imageHeight={256} width="80%" height="80%" />}
                            </vstack>
                          );
                        })}
                      </hstack>
                    ))}
                </vstack>

                {mode === 'medium' && (
                    <vstack alignment="center">
                        <text size="xsmall" weight="bold">MOVE LIMIT:</text>
                        <hstack gap="medium" alignment="middle">
                            <button icon="subtract" size="small" onPress={() => setCustomMoves(Math.max(3, customMoves - 1))} />
                            <text size="xlarge" weight="bold" color="#9900ff">{customMoves}</text>
                            <button icon="add" size="small" onPress={() => setCustomMoves(Math.min(15, customMoves + 1))} />
                        </hstack>
                    </vstack>
                )}

                {mode === 'hard' && (
                    <vstack alignment="center">
                         <text size="xsmall" weight="bold">MINE DENSITY:</text>
                         <hstack gap="medium" alignment="middle">
                            <button icon="subtract" size="small" onPress={() => setCustomMines(Math.max(5, customMines - 1))} />
                            <text size="xlarge" weight="bold" color="#ff0055">{customMines}</text>
                            <button icon="add" size="small" onPress={() => setCustomMines(Math.min(25, customMines + 1))} />
                        </hstack>
                    </vstack>
                )}

                <hstack gap="medium">
                    <button appearance="secondary" onPress={() => setIsCreating(false)}>CANCEL</button>
                    <button appearance="primary" onPress={postChallenge} disabled={creatorGhostIndex === -1}>POST CHALLENGE</button>
                </hstack>
            </vstack>
        </zstack>
    );
  }

  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <image url="background.jpg" imageWidth={1080} imageHeight={1920} width="100%" height="100%" resizeMode="cover" />
      <vstack width="100%" height="100%" backgroundColor="#00000080" /> 
      {(isDead || shake > 0) && <vstack width="100%" height="100%" backgroundColor="#330000D9" />}

      <vstack width="100%" height="100%" padding={shakePad} alignment="center middle" gap="small">
        <hstack width="100%" alignment="middle center">
          <button size="small" appearance="secondary" onPress={onBack}>{data?.isCustom ? "ABORT" : "❮ MENU"}</button>
          <spacer grow />
          {data?.isCustom ? (
             <vstack alignment="end">
                <text size="xsmall" color="#FFD700">AUTHOR</text>
                <text size="small" weight="bold">{data.customTitle}</text>
             </vstack>
          ) : (
            <hstack gap="small" alignment="middle" backgroundColor="#000000CC" padding="small" cornerRadius="full" borderColor="#FFD700" border="thin">
                <image url="streak.jpg" imageWidth={40} imageHeight={40} width="16px" height="16px" />
                <text color="#FFD700" weight="bold" size="small">{displayStreak}</text>
            </hstack>
          )}
        </hstack>

        <spacer height="10px" />
        
        <vstack alignment="center middle" width="100%">
          <vstack padding="small" backgroundColor="#00000099" cornerRadius="large" borderColor={isDead ? "#ff0055" : "#00ffcc"} border="thin" gap="small">
            {[...Array(gridSize)].map((_, r) => (
              <hstack key={r.toString()} gap="small" alignment="center middle">
                {[...Array(gridSize)].map((_, c) => {
                  const s = scannedTiles[`${c}-${r}`];
                  const isScanned = s !== undefined;
                  let tileColor = "#0a1520";
                  if(isScanned) {
                    if(s === -1) tileColor = "#ff0033";
                    else if(s === 100) tileColor = "#8A2BE2"; 
                    else if(s >= 90) tileColor = "#ee00fb"; 
                    else if(s >= 80) tileColor = "#ff5cec"; 
                    else if(s >= 60) tileColor = "#0596fe"; 
                    else if(s >= 40) tileColor = "#283b7e"; 
                    else tileColor = "#0e161ed2";           
                  }
                  return (
                    <vstack key={c.toString()} width={tileSize} height={tileSize} backgroundColor={tileColor} onPress={() => handleScan(c, r)} alignment="center middle" cornerRadius="small" borderColor="#ffffff11" border="thin">
                      {s === 100 ? <image url="goodghost.jpg" imageWidth={256} imageHeight={256} width="80%" height="80%" /> :
                       s === -1 ? <image url="evilghost.jpg" imageWidth={256} imageHeight={256} width="80%" height="80%" /> :
                       isScanned ? <text color="white" size="xsmall" weight="bold">{s}</text> : null}
                    </vstack>
                  );
                })}
              </hstack>
            ))}
          </vstack>
        </vstack>

        <spacer grow />
        
        <vstack alignment="center" gap="xsmall" padding="xsmall" width="100%">
            <text color={isDead ? "#ff0000" : "#20fff8"} weight="bold" size="small">
                {isDead ? (mode === 'medium' && attempts >= RANGER_LIMIT ? "BATTERY DEPLETED" : "⚠ SIGNAL LOST") : gameOver ? "✔ GHOST CAPTURED" : (mode === 'medium' ? `BATTERY: ${RANGER_LIMIT - attempts} / ${RANGER_LIMIT}` : `CYCLES: ${attempts}`)}
            </text>
            
            {gameOver && (
                <vstack alignment="center" gap="xsmall" width="100%">
                    <text color="white" size="xsmall">{attempts} MOVES</text>
                    
                    {data?.isCustom && (
                        <text color="#FFD700" size="small" weight="bold">CONTRACTS COMPLETED: {totalContracts + (submitted ? 0 : 1)}</text>
                    )}

                    <vstack gap="xsmall" width="100%" alignment="center">
                         {(!submitted && !data?.alreadyUploaded) && (
                            <button 
                                size="small" 
                                appearance={data?.isCustom ? "secondary" : "primary"} 
                                onPress={submitScore}
                            >
                                {data?.isCustom ? "CLAIM BOUNTY" : "UPLOAD SCORE"}
                            </button>
                         )}
                        
                        {!isDead && !data?.isCustom && (
                            <button 
                                size="small" 
                                appearance="bordered" 
                                icon="add" 
                                onPress={() => { setIsCreating(true); setCreatorGhostIndex(-1); }}
                            >
                                {mode === 'hard' ? 'CREATE TRAP' : 'CREATE CHALLENGE'}
                            </button>
                        )}
                        
                    </vstack>
                    
                    {(submitted || data?.alreadyUploaded) && !data?.isCustom && <text color="#FFD700" size="xsmall">STREAK SAVED</text>}
                </vstack>
            )}
            {isDead && mode === 'medium' && <button size="small" appearance="primary" onPress={rechargeSystem}>RECHARGE SYSTEM</button>}
        </vstack>
        <spacer height="4px" />
      </vstack>
    </zstack>
  );
};

// ---------------
//  MAIN CONFIG
// ---------------

Devvit.addMenuItem({
  label: "Create Spectral Signal Game",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    await context.reddit.submitPost({
      title: "Daily Spectral Signal: System Breach",
      subredditName: subreddit.name,
      preview: <vstack height="100%" width="100%" alignment="middle center" backgroundColor="#000510"><text size="large" color="#00ffcc">BOOTING SYSTEM...</text></vstack>,
    });
    context.ui.showToast("System Online");
  },
});

Devvit.addCustomPostType({
  name: 'Spectral Signal',
  height: 'tall',
  render: (context) => {
    const [currentMode, setCurrentMode] = useState<string>('menu');
    const [viewedCustomPost, setViewedCustomPost] = useState(false);

    // ---ACTIVE USER TRACKING---
    const { data: dailyCount } = useAsync(async () => {
        const today = new Date().toISOString().split('T')[0];
        const key = `daily_agents_${today}`;
        if (context.userId) {
            await context.redis.zAdd(key, { member: context.userId, score: Date.now() });
        }
        return await context.redis.zCard(key);
    });

    const { data: initData } = useAsync(async () => {
        const customDataString = await context.redis.get(`puzzle:${context.postId}`);
        if(customDataString) {
            const d = JSON.parse(customDataString);
            return { mode: d.mode, author: d.author };
        }
        return { mode: null, author: null };
    });

    if (initData?.mode && currentMode === 'menu' && !viewedCustomPost) {
        setViewedCustomPost(true);
        if(initData.mode === 'easy' || initData.mode === 'scout') return <GameController mode="easy" context={context} onBack={() => setCurrentMode('menu')} />;
        if(initData.mode === 'medium' || initData.mode === 'ranger') return <GameController mode="medium" context={context} onBack={() => setCurrentMode('menu')} />;
        if(initData.mode === 'hard' || initData.mode === 'elite') return <GameController mode="hard" context={context} onBack={() => setCurrentMode('menu')} />;
    }

    if (currentMode === 'leaderboard') return <LeaderboardScreen context={context} onBack={() => setCurrentMode('menu')} />;

    if (currentMode === 'menu') {
      
      if (initData?.mode) {
          const modeMap: Record<string, string> = { 'easy': 'SCOUT', 'scout': 'SCOUT', 'medium': 'RANGER', 'ranger': 'RANGER', 'hard': 'ELITE', 'elite': 'ELITE' };
          const modeName = modeMap[initData.mode] || 'UNKNOWN';
          const themeColor = modeName === 'SCOUT' ? '#00ffcc' : modeName === 'RANGER' ? '#9900ff' : '#ff0055';

          return (
            <zstack width="100%" height="100%" alignment="center middle">
                <image url="background.jpg" imageWidth={1080} imageHeight={1920} width="100%" height="100%" resizeMode="cover" />
                <vstack width="100%" height="100%" backgroundColor="#00000080" alignment="center middle" gap="medium">
                    <vstack padding="medium" backgroundColor="#000000CC" cornerRadius="medium" borderColor={themeColor} border="thick" alignment="center" gap="small" width="80%">
                        <text size="large" weight="bold" color={themeColor}>INCOMING TRANSMISSION</text>
                        <text size="small" color="white" alignment="center">
                            Agent u/{initData.author} has hidden a Ghost in sector {modeName}.
                        </text>
                        <spacer height="10px" />
                        <button appearance="primary" onPress={() => {
                            if(modeName === 'SCOUT') setCurrentMode('easy');
                            if(modeName === 'RANGER') setCurrentMode('medium');
                            if(modeName === 'ELITE') setCurrentMode('hard');
                        }}>
                            ACCEPT {modeName} MISSION
                        </button>
                    </vstack>
                </vstack>
            </zstack>
          );
      }

      return (
        <zstack width="100%" height="100%" alignment="center middle">
          <image url="background.jpg" imageWidth={1080} imageHeight={1920} width="100%" height="100%" resizeMode="cover" />
          <vstack width="100%" height="100%" backgroundColor="#00000080" /> 

          <vstack height="100%" width="100%" alignment="center middle" padding="medium">
            <vstack alignment="center" gap="small">
                <text size="xxlarge" weight="bold" color="#ffffff">SPECTRAL SIGNAL</text>
            </vstack>

            <spacer grow />
            
            <vstack gap="medium" width="280px">
              <MenuCard title="SCOUT" desc="6x6 Grid • Safe" color="#00ffcc" onPress={() => setCurrentMode('easy')} />
              <MenuCard title="RANGER" desc="8x8 Grid • 7 Moves" color="#9900ff" onPress={() => setCurrentMode('medium')} />
              <MenuCard title="ELITE" desc="11 Mines • PERMADEATH" color="#ff0055" onPress={() => setCurrentMode('hard')} />
            </vstack>
            
            <spacer grow />
            
            <RealFooter count={dailyCount} onLeaderboard={() => setCurrentMode('leaderboard')} />
          </vstack>
        </zstack>
      );
    }
    return <GameController mode={currentMode} context={context} onBack={() => setCurrentMode('menu')} />;
  },
});

export default Devvit;