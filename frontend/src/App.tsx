import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  Users, TrendingUp, DollarSign, AlertTriangle, 
  ArrowRight, Upload, Search, ShieldCheck, Zap, 
  ChevronRight, Info, BarChart3, PieChart as PieChartIcon,
  LayoutDashboard, UserPlus, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { cn } from './lib/utils';
import { PredictionResult, DashboardStats, CustomerData } from './types';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 text-sm font-bold transition-all rounded-xl relative group",
      active 
        ? "bg-brand text-white shadow-xl shadow-brand/30" 
        : "text-white/40 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={18} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-white/40")} />
    {label}
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute -left-2 w-1 h-6 bg-white rounded-full"
      />
    )}
  </button>
);

const StatCard = ({ label, value, icon: Icon, trend, color }: { label: string, value: string | number, icon: any, trend?: string, color: string }) => (
  <div className="card group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3", color)}>
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <div className="px-2 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
          <TrendingUp size={10} />
          {trend}
        </div>
      )}
    </div>
    <span className="label-micro block mb-1">{label}</span>
    <div className="stat-value">{value}</div>
  </div>
);

const StrategyCard = ({ probability, importance }: { probability: number, importance: any[] }) => {
  let strategy = {
    title: "로열티 프로그램 강화",
    description: "고객 상태가 건강합니다. 장기적인 유지와 업셀링에 집중하세요.",
    actions: ["VIP 프로그램 초대", "분기별 뉴스레터 발송", "신상품 얼리 액세스 제공"],
    color: "bg-white border-gray-light text-dark",
    icon: ShieldCheck,
    accent: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-600"
  };

  if (probability >= 70) {
    strategy = {
      title: "즉각적인 개입 필요",
      description: "이탈 위험이 매우 높습니다. 즉각적인 고관여 대응이 필요합니다.",
      actions: ["20% 할인 쿠폰 즉시 발송", "VIP 전담 상담 전화 예약", "1개월 무료 구독권 제공"],
      color: "bg-dark text-white border-dark",
      icon: AlertTriangle,
      accent: "bg-brand",
      badge: "bg-brand/20 text-brand"
    };
  } else if (probability >= 40) {
    strategy = {
      title: "선제적 관계 강화",
      description: "중간 수준의 위험이 감지되었습니다. 부가 가치 제공으로 관계를 강화하세요.",
      actions: ["개인화된 상품 추천", "다음 구매 시 포인트 2배 적립", "리워드 제공 설문조사"],
      color: "bg-white border-brand text-dark",
      icon: Zap,
      accent: "bg-orange-500",
      badge: "bg-orange-50 text-orange-600"
    };
  }

  const Icon = strategy.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-10 rounded-[2rem] border-2 shadow-2xl relative overflow-hidden", strategy.color)}
    >
      {probability >= 70 && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] -mr-32 -mt-32" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className={cn("p-4 rounded-2xl shadow-lg", strategy.accent)}>
              <Icon size={32} className="text-white" />
            </div>
            <div>
              <div className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-1 inline-block", strategy.badge)}>
                {probability >= 70 ? 'High Risk' : probability >= 40 ? 'Medium Risk' : 'Low Risk'}
              </div>
              <h3 className="text-3xl font-black tracking-tighter">{strategy.title}</h3>
            </div>
          </div>
          <div className="text-right">
            <span className="label-micro opacity-50 block mb-1">Churn Probability</span>
            <span className={cn("text-5xl font-mono font-black", probability >= 70 ? "text-brand" : "text-current")}>
              {probability}%
            </span>
          </div>
        </div>

        <p className="mb-10 text-xl font-medium opacity-80 leading-relaxed max-w-2xl">{strategy.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {strategy.actions.map((action, i) => (
            <div key={i} className={cn(
              "flex items-center gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.02]",
              probability >= 70 ? "bg-white/5 border-white/10" : "bg-gray-light/10 border-gray-light/50"
            )}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", strategy.accent)}>
                <ChevronRight size={18} className="text-white" />
              </div>
              <span className="font-bold text-sm">{action}</span>
            </div>
          ))}
        </div>

        <div className={cn("mt-12 pt-10 border-t flex flex-wrap items-center justify-between gap-6", 
          probability >= 70 ? "border-white/10" : "border-gray-light")}>
          <div className="flex items-center gap-4">
            <span className="label-micro opacity-50">Key Drivers:</span>
            <div className="flex gap-2">
              {importance.slice(0, 3).map((imp, i) => (
                <span key={i} className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  probability >= 70 ? "bg-white/10 text-white" : "bg-dark text-white"
                )}>
                  {imp.feature}
                </span>
              ))}
            </div>
          </div>
          <button className={cn(
            "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:opacity-80",
            probability >= 70 ? "bg-white text-dark" : "bg-brand text-white"
          )}>
            상세 리포트 다운로드
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predict' | 'explain'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Prediction State
  const [formData, setFormData] = useState<CustomerData>({
    recency: 15,
    frequency: 5,
    monetary: 250,
    tenure: 120
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPredicting(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const firstRow = results.data[0] as any;
        if (firstRow) {
          setFormData({
            recency: firstRow.recency || 0,
            frequency: firstRow.frequency || 0,
            monetary: firstRow.monetary || 0,
            tenure: firstRow.tenure || 0
          });
          // Auto-predict after upload
          setTimeout(() => handlePredict(), 100);
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 bg-dark p-8 flex flex-col gap-12 sticky top-0 h-screen">
        <div className="flex items-center gap-3">
          <div className="bg-brand text-white p-2 rounded-xl shadow-lg shadow-brand/30">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">ChurnGuard</h1>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="대시보드 개요" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={UserPlus} 
            label="이탈 예측 실행" 
            active={activeTab === 'predict'} 
            onClick={() => setActiveTab('predict')} 
          />
          <SidebarItem 
            icon={FileText} 
            label="모델 분석 리포트" 
            active={activeTab === 'explain'} 
            onClick={() => setActiveTab('explain')} 
          />
        </nav>

        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">System Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60 font-bold">Engine Version</span>
                <span className="text-[11px] text-white font-mono">v1.0.4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60 font-bold">Uptime</span>
                <span className="text-[11px] text-white font-mono">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-auto bg-white">
        <header className="mb-16 flex justify-between items-end border-b border-gray-light pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-brand text-white text-[10px] font-black rounded-full uppercase tracking-widest">Enterprise AI</span>
              <div className="h-px w-12 bg-gray-light" />
            </div>
            <h2 className="text-6xl font-black text-dark tracking-tighter leading-none">
              {activeTab === 'dashboard' ? '유지 전략 대시보드' : 
               activeTab === 'predict' ? '고객 이탈 예측' : '모델 설명성 보고서'}
            </h2>
            <p className="text-dark/40 mt-6 font-medium max-w-2xl text-lg leading-relaxed">
              {activeTab === 'dashboard' ? '고객 행동 패턴을 실시간으로 분석하여 비즈니스 성장을 위한 핵심 인사이트를 제공합니다.' : 
               activeTab === 'predict' ? '머신러닝 엔진이 개별 고객의 이탈 가능성을 정밀하게 계산하고 최적의 유지 전략을 도출합니다.' : '예측 모델의 투명성을 확보하기 위해 주요 변수별 영향력과 판단 근거를 상세히 분석합니다.'}
            </p>
          </div>
          <div className="bg-dark p-6 rounded-3xl text-right min-w-[200px] shadow-2xl shadow-dark/20">
            <span className="label-micro mb-2 block text-white/40">Data Sync Status</span>
            <div className="flex items-center justify-end gap-2 text-white">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-mono font-black">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="총 고객 수" value={stats?.totalCustomers || 0} icon={Users} color="bg-dark" trend="전월 대비 +12%" />
                <StatCard label="이탈률" value={`${stats?.churnRate || 0}%`} icon={AlertTriangle} color="bg-brand" trend="전월 대비 -2.4%" />
                <StatCard label="평균 LTV" value={`$${stats?.avgLTV || 0}`} icon={DollarSign} color="bg-emerald-500" trend="전월 대비 +5.2%" />
                <StatCard label="예측 신뢰도" value="94.2%" icon={ShieldCheck} color="bg-dark" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="card">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-dark flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-brand rounded-full" />
                      이탈 위험도 분포
                    </h3>
                    <div className="flex gap-2">
                       <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold opacity-40">Low</span></div>
                       <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-[10px] font-bold opacity-40">Mid</span></div>
                       <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand" /><span className="text-[10px] font-bold opacity-40">High</span></div>
                    </div>
                  </div>
                  <div className="h-72 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.churnDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {stats?.churnDistribution?.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#10b981' : index === 4 ? '#FD3706' : index === 3 ? '#f97316' : index === 2 ? '#222026' : '#DBDBDB'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-dark flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-brand rounded-full" />
                      전역 변수 중요도
                    </h3>
                    <button className="text-dark/20 hover:text-dark/40 transition-colors"><Info size={20} /></button>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.featureImportance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#222026', fontWeight: 700 }} width={100} />
                        <Tooltip 
                           cursor={{ fill: '#F3F4F6' }}
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                        />
                        <Bar dataKey="value" fill="#FD3706" radius={[0, 6, 6, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'predict' && (
            <motion.div 
              key="predict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-12"
            >
              {/* Input Section */}
              <div className="xl:col-span-4 space-y-8">
                <div className="card">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-dark">고객 데이터 분석</h3>
                    <label className="cursor-pointer text-brand hover:underline text-[11px] font-black flex items-center gap-1.5 uppercase tracking-wider">
                      <Upload size={16} />
                      CSV Upload
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                    </label>
                  </div>
                  
                  <form onSubmit={handlePredict} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="label-micro block">최근 구매일 (Recency)</label>
                        <input 
                          type="number" 
                          value={formData.recency}
                          onChange={e => setFormData({...formData, recency: parseInt(e.target.value)})}
                          className="w-full px-4 py-4 bg-white border-2 border-gray-light rounded-2xl focus:border-brand outline-none transition-all font-mono font-bold text-dark"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-micro block">구매 빈도 (Frequency)</label>
                        <input 
                          type="number" 
                          value={formData.frequency}
                          onChange={e => setFormData({...formData, frequency: parseInt(e.target.value)})}
                          className="w-full px-4 py-4 bg-white border-2 border-gray-light rounded-2xl focus:border-brand outline-none transition-all font-mono font-bold text-dark"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="label-micro block">누적 구매액 (Monetary)</label>
                        <input 
                          type="number" 
                          value={formData.monetary}
                          onChange={e => setFormData({...formData, monetary: parseInt(e.target.value)})}
                          className="w-full px-4 py-4 bg-white border-2 border-gray-light rounded-2xl focus:border-brand outline-none transition-all font-mono font-bold text-dark"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-micro block">가입 기간 (Tenure)</label>
                        <input 
                          type="number" 
                          value={formData.tenure}
                          onChange={e => setFormData({...formData, tenure: parseInt(e.target.value)})}
                          className="w-full px-4 py-4 bg-white border-2 border-gray-light rounded-2xl focus:border-brand outline-none transition-all font-mono font-bold text-dark"
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={predicting}
                      className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {predicting ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap size={20} />
                          분석 실행
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="p-6 bg-dark text-white rounded-2xl flex gap-4 shadow-xl shadow-dark/20">
                  <Info size={24} className="text-brand shrink-0" />
                  <p className="text-xs font-medium leading-relaxed opacity-80">
                    <strong>데이터 가이드:</strong> 정확한 예측을 위해 RFM(Recency, Frequency, Monetary) 지표를 최신 상태로 유지해 주세요. 대량 분석이 필요한 경우 CSV 업로드 기능을 권장합니다.
                  </p>
                </div>
              </div>

              {/* Results Section */}
              <div className="xl:col-span-8 space-y-10">
                {prediction ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="card flex flex-col items-center justify-center text-center py-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                           <div className="px-2 py-1 bg-dark text-white text-[9px] font-black rounded uppercase tracking-widest">Risk Score</div>
                        </div>
                        <div className="relative w-40 h-40 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="80"
                              cy="80"
                              r="72"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="transparent"
                              className="text-gray-light"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="72"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="transparent"
                              strokeDasharray={452.4}
                              strokeDashoffset={452.4 - (452.4 * prediction.churnProbability) / 100}
                              className={cn(
                                "transition-all duration-1000 ease-out",
                                prediction.churnProbability >= 70 ? "text-brand" : 
                                prediction.churnProbability >= 40 ? "text-orange-500" : "text-emerald-500"
                              )}
                            />
                          </svg>
                          <span className="absolute text-5xl font-mono font-black text-dark">{prediction.churnProbability}%</span>
                        </div>
                        <div className="mt-8 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-brand" />
                          <p className="text-sm font-bold text-dark/60">
                            예측 신뢰도: <span className="text-dark font-black">{prediction.confidence.toFixed(1)}%</span>
                          </p>
                        </div>
                      </div>

                      <div className="card">
                        <h3 className="text-lg font-black text-dark mb-8 flex items-center gap-2">
                           <LayoutDashboard size={20} className="text-brand" />
                           모델별 앙상블 결과
                        </h3>
                        <div className="space-y-6">
                          {[
                            { name: '로지스틱 회귀', val: prediction.models.logisticRegression },
                            { name: '랜덤 포레스트', val: prediction.models.randomForest },
                            { name: 'XGBoost', val: prediction.models.xgBoost }
                          ].map((m, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-tight">
                                <span className="text-dark/60">{m.name}</span>
                                <span className="text-dark">{m.val}%</span>
                              </div>
                              <div className="w-full bg-gray-light h-2 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${m.val}%` }}
                                  className="bg-dark h-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <StrategyCard probability={prediction.churnProbability} importance={prediction.importance} />

                    <div className="card">
                      <h3 className="text-lg font-black text-dark mb-8 flex items-center gap-2">
                         <BarChart3 size={20} className="text-brand" />
                         개별 변수 영향도 (SHAP Analysis)
                      </h3>
                      <div className="space-y-6">
                        {prediction.importance.map((imp, i) => (
                          <div key={i} className="flex items-center gap-6">
                            <span className="text-xs font-black text-dark w-36 shrink-0">{imp.feature}</span>
                            <div className="flex-1 bg-gray-light h-10 rounded-xl relative overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${imp.impact * 100}%` }}
                                className="bg-brand h-full opacity-90"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-black text-dark">
                                +{(imp.impact * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-24 border-4 border-dashed border-gray-light rounded-[2rem] bg-white">
                    <div className="bg-gray-light/30 p-6 rounded-full mb-6">
                      <Search size={48} className="text-dark/20" />
                    </div>
                    <h3 className="text-2xl font-black text-dark">분석 준비 완료</h3>
                    <p className="text-dark/40 max-w-sm mt-3 font-medium">
                      고객 데이터를 입력하거나 CSV 파일을 업로드하여 AI 기반 이탈 예측 및 맞춤형 유지 전략을 확인하세요.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'explain' && (
            <motion.div 
              key="explain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="card lg:col-span-2">
                  <h3 className="text-xl font-black text-dark mb-10 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-brand rounded-full" />
                    모델 성능 지표 (Performance Metrics)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: '정확도 (Accuracy)', val: '92.4%' },
                      { label: '정밀도 (Precision)', val: '88.1%' },
                      { label: '재현율 (Recall)', val: '84.5%' },
                      { label: 'F1 스코어', val: '86.2%' }
                    ].map((m, i) => (
                      <div key={i} className="p-6 bg-[#F9F9F9] rounded-2xl border border-gray-light text-center shadow-sm">
                        <span className="label-micro block mb-2">{m.label}</span>
                        <span className="text-2xl font-mono font-black text-dark">{m.val}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12">
                    <h4 className="label-micro mb-6">정밀도-재현율 곡선 (Precision-Recall Curve)</h4>
                    <div className="h-72 bg-[#F9F9F9] rounded-[2rem] border border-gray-light p-8">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={[
                           { r: 0, p: 1 }, { r: 0.2, p: 0.98 }, { r: 0.4, p: 0.95 }, 
                           { r: 0.6, p: 0.88 }, { r: 0.8, p: 0.75 }, { r: 1, p: 0.4 }
                         ]}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#DBDBDB" />
                           <XAxis dataKey="r" label={{ value: 'Recall', position: 'insideBottom', offset: -5, fontWeight: 700 }} fontSize={11} tick={{ fontWeight: 600 }} />
                           <YAxis label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontWeight: 700 }} fontSize={11} tick={{ fontWeight: 600 }} />
                           <Tooltip contentStyle={{ borderRadius: '12px', fontWeight: 700 }} />
                           <Line type="monotone" dataKey="p" stroke="#FD3706" strokeWidth={4} dot={{ r: 6, fill: '#FD3706', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                         </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="card">
                    <h3 className="text-lg font-black text-dark mb-6">모델 아키텍처 상세</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-dark/40">알고리즘</span>
                        <span className="text-dark">XGBoost Ensemble</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-dark/40">최근 업데이트</span>
                        <span className="text-dark">2026-03-28</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-dark/40">학습 데이터셋</span>
                        <span className="text-dark">45,200 Records</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-dark/40">하이퍼파라미터</span>
                        <span className="text-dark">Optuna Optimized</span>
                      </div>
                    </div>
                    <button className="w-full mt-8 py-4 bg-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-dark/90 transition-all">
                      모델 재학습 (Retrain)
                    </button>
                  </div>

                  <div className="card bg-brand text-white border-none shadow-2xl shadow-brand/20">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                      <Zap size={24} className="text-white" />
                      AI Insight
                    </h3>
                    <p className="text-sm font-bold leading-relaxed opacity-90">
                      현재 모델 분석 결과, <strong>최근 구매일(Recency)</strong>이 이탈 예측의 42%를 결정하는 핵심 지표로 나타났습니다. 30일 이상 미구매 고객을 대상으로 한 타겟팅 캠페인이 가장 효과적일 것으로 예측됩니다.
                    </p>
                    <div className="mt-8 pt-6 border-t border-white/20">
                      <button className="text-[11px] font-black uppercase tracking-widest text-white hover:underline flex items-center gap-2">
                        View Full SHAP Summary <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
