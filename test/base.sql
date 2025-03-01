--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.3

-- Started on 2025-02-28 15:45:16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16392)
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    "userId" text NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16413)
-- Name: account_create_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_create_data (
    "accountId" text NOT NULL
);


ALTER TABLE public.account_create_data OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16420)
-- Name: account_update_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_update_data (
    "accountId" text NOT NULL
);


ALTER TABLE public.account_update_data OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 16707)
-- Name: image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image (
    id text NOT NULL,
    "dataUrl" text NOT NULL
);


ALTER TABLE public.image OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16518)
-- Name: mob; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mob (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    captureable boolean NOT NULL,
    "baseLv" integer NOT NULL,
    experience integer NOT NULL,
    "partsExperience" integer NOT NULL,
    "elementType" text NOT NULL,
    radius integer NOT NULL,
    maxhp integer NOT NULL,
    "physicalDefense" integer NOT NULL,
    "physicalResistance" integer NOT NULL,
    "magicalDefense" integer NOT NULL,
    "magicalResistance" integer NOT NULL,
    "criticalResistance" integer NOT NULL,
    avoidance integer NOT NULL,
    dodge integer NOT NULL,
    block integer NOT NULL,
    "normalAttackResistanceModifier" integer NOT NULL,
    "physicalAttackResistanceModifier" integer NOT NULL,
    "magicalAttackResistanceModifier" integer NOT NULL,
    actions jsonb NOT NULL,
    details text NOT NULL,
    "dataSources" text NOT NULL,
    "statisticId" text NOT NULL,
    "imageId" text NOT NULL,
    "updatedByAccountId" text,
    "createdByAccountId" text
);


ALTER TABLE public.mob OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 16700)
-- Name: statistic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statistic (
    id text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "usageTimestamps" timestamp(3) without time zone[],
    "viewTimestamps" timestamp(3) without time zone[]
);


ALTER TABLE public.statistic OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16385)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "roleType" text NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 3611 (class 0 OID 16392)
-- Dependencies: 216
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, "userId") FROM stdin;
cluhz95c5000078elg5r46i83	User	qq	591519722	\N	\N	\N	\N	\N	\N	\N	cluhz95c5000078elg5r46831
\.


--
-- TOC entry 3612 (class 0 OID 16413)
-- Dependencies: 219
-- Data for Name: account_create_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_create_data ("accountId") FROM stdin;
cluhz95c5000078elg5r46i83
\.


--
-- TOC entry 3613 (class 0 OID 16420)
-- Dependencies: 220
-- Data for Name: account_update_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_update_data ("accountId") FROM stdin;
cluhz95c5000078elg5r46i83
\.


--
-- TOC entry 3616 (class 0 OID 16707)
-- Dependencies: 261
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.image (id, "dataUrl") FROM stdin;
system	
\.


--
-- TOC entry 3614 (class 0 OID 16518)
-- Dependencies: 234
-- Data for Name: mob; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mob (id, name, type, captureable, "baseLv", experience, "partsExperience", "elementType", radius, maxhp, "physicalDefense", "physicalResistance", "magicalDefense", "magicalResistance", "criticalResistance", avoidance, dodge, block, "normalAttackResistanceModifier", "physicalAttackResistanceModifier", "magicalAttackResistanceModifier", actions, details, "dataSources", "statisticId", "imageId", "updatedByAccountId", "createdByAccountId") FROM stdin;
clv6we81i001nwv1ftd6jymzi	奥克拉辛	Boss	f	226	21100	0	Dark	1	0	987	30	987	30	30	338	0	0	0	5	5	{}	部位被破坏时，降低抗性与防御	fengli	15	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6wik7s001pwv1fkf2t5c6z	犰尔达	Boss	f	229	25000	0	Earth	1	5500000	1717	39	1717	39	40	343	0	30	0	1	5	{}	部位被破坏时，降低抗性与防御	fengli	14	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6vznrs001hwv1f78z595uu	兵龙达鲁巴	Boss	f	217	16700	0	Earth	1	0	596	8	705	8	40	487	5	35	0	5	10	{}	部位被破坏时，格挡率会降低。	fengli	17	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6xawyo001vwv1fcicqcor2	欺龙米缪加	Boss	f	238	22600	0	Earth	1	0	2620	9	2620	9	35	357	0	5	0	10	15	{}	部位被破坏后，防御力降低。	fengli	11	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6ydapf0029wv1fz5zss4fd	尉龙鲁迪斯	Boss	f	259	24600	0	Earth	1	0	647	10	906	10	35	388	0	10	0	5	5	{}	部位受到破坏时，解除昏厥免疫	fengli	4	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6vraf5001dwv1f0mm86k44	岩龙菲尔岑	Boss	f	211	15150	0	Earth	1	3171000	1055	8	739	8	20	316	2	8	0	10	20	{}	被破坏部位后防御力会降低，并能释放更多种类的技能	fengli	3	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6x7ebl001twv1fnhnoc8ln	灼龙伊戈涅乌斯	Boss	f	235	20800	0	Fire	1	0	823	9	823	9	20	350	1	1	0	15	20	{}	血量降低至50%以后，抗性增加，并在一段时间免疫控制。	fengli	12	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6w6zqu001jwv1fq5r6q9dv	炎龙布兰玛	Boss	f	220	16700	0	Fire	1	5600000	880	8	880	8	30	412	7	0	0	10	15	{}	血量越低，抗性与防御越低	fengli	1	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv93ha6000fu048qq11zx9y	伊科诺斯	Boss	f	108	4200	0	Earth	1	0	162	10	140	10	0	162	0	10	0	0	0	{}	血量每下降33%，防御能力会发生变化	fengli	63	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6wmh4w001rwv1f8aa3u6vh	护卫魔像	Boss	f	232	38000	0	Normal	1	0	1160	25	1160	25	20	418	0	25	0	0	0	{}	血量低于50%以后切换形态；红色形态的回血期间受到麻痹会被打断。	fengli	13	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6uxjlm000xwv1fb3g0tjv4	薇芮娜·超柯尔连生体	Boss	f	195	57000	0	Fire	1	0	819	7	585	7	5	438	6	0	0	1	5	{}	经验值包括柱子。一阶段受到翻覆后获得高额减伤；三阶段受到翻覆后会在自身脚下释放漩涡。	fengli	24	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6vjtv30019wv1fcyunhqls	雷丽莎	Boss	f	210	26200	0	Dark	1	0	420	8	630	8	30	630	5	5	0	1	10	{}	第二阶段血量降低至50%以下后，暴击抗性提高至500	fengli	20	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6uoufi000twv1fal4xlw5j	魔晶鹫	Boss	f	190	27200	0	Dark	1	0	523	7	618	7	15	428	10	5	0	5	5	{}	第二阶段属性会变为风属性	fengli	28	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvgvr59000pu048jlo772t4	热带梦貘	Boss	f	120	7800	0	Normal	1	7813000	144	4	168	4	0	360	5	5	0	25	40	{}	睡着了会回血	fengli	57	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6xdtcv001xwv1ft4jvd8r1	丝岩比尔	Boss	f	241	24400	0	Fire	1	0	361	9	723	9	55	541	0	0	0	0	0	{}	生命值高于50%时，免疫胆怯	fengli	10	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6tmq9x000hwv1fu7b0bmsr	库斯特	Boss	f	178	18200	0	Earth	1	0	534	7	534	7	25	267	5	5	0	5	5	{}	生命值每降低33%切换一阶段。每次切换阶段会进行召唤，可用控制打断。	fengli	33	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6vo2mo001bwv1f0vxczx5u	晶玛体	Boss	f	208	14080	0	Fire	1	0	728	16	728	16	20	468	3	3	0	5	10	{}	每降低25%最大生命值，会进入一段时间的高抗性状态，受到：昏厥、麻痹、着火会解除该状态。	fengli	19	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6y70u50025wv1fqyhsjcz9	多米纳雷多尔	Boss	f	253	32500	0	Dark	1	0	1265	50	1265	50	30	450	5	20	0	1	15	{}	每失去一个球，双抗降低10%，并降低闪躲率和格挡率	fengli	6	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6v4ws60011wv1f5ztq57so	恶灵巨蛛	Boss	f	196	11600	0	Dark	1	0	511	7	392	7	0	353	4	4	0	20	20	{}	最后阶段飞天开始向后位移时可以被控制。	fengli	25	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvi2py9001lu048nvjh3joe	漂漂妈	Boss	f	151	12400	0	Water	1	0	226	6	271	6	0	226	5	0	0	15	20	{}	无	fengli	101	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui5luln000b11my87rwbzsk	米诺陶诺斯	Boss	f	32	420	0	Wind	1	0	48	1	48	1	0	48	4	0	0	5	5	{}	无	fengli	100	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui5v02h000f11myc5ylpafa	迪赛尔蛮龙	Boss	f	40	560	0	Earth	1	0	20	1	20	1	0	75	0	9	0	15	15	{}	无	fengli	99	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui66v15000j11myurfawvy9	遗迹魔像	Boss	f	45	660	0	Earth	1	0	106	1	106	1	0	14	0	50	0	15	15	{}	无	fengli	98	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui69tqk000l11mygtkum8iv	弗雷帝亚	Boss	f	49	1480	0	Wind	1	0	24	1	24	1	0	292	10	0	0	10	5	{}	无	fengli	97	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui6d9hj000n11mydvgshlcp	焰狼沃格	Boss	f	50	1500	0	Fire	1	0	100	2	100	2	0	56	30	0	0	25	50	{}	无	fengli	96	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui6iio3000p11my11qq7s9z	亚思托	Boss	f	50	760	0	Water	1	0	50	1	150	1	0	112	15	0	0	25	1	{}	无	fengli	95	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui6r7n8000r11myjtveczlw	黏液怪	Boss	f	52	1400	0	Water	1	0	78	12	78	12	0	0	0	50	0	5	5	{}	无	fengli	94	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui589ck000311my0p5bgm0o	出土魔像	Boss	f	16	90	0	Normal	1	3150	12	0	12	0	0	12	0	10	0	15	15	{}	无	fengli	93	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui7cvao001111myok0n3ps3	獠牙王	Boss	f	62	3000	0	Normal	1	0	62	2	62	2	0	279	4	8	0	10	10	{}	无	fengli	92	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui74bi7000t11my1qhbbgjc	马维兹	Boss	f	55	1290	0	Water	1	0	165	7	165	7	0	41	3	30	0	10	5	{}	无	fengli	91	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluozah5r0000ijciwqr8rbg2	上古女帝	Boss	f	64	3120	0	Light	1	0	32	52	32	52	0	48	1	8	0	10	10	{}	无	fengli	86	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui5a9ql000511my8n0qi7kh	幽灵兵甲	Boss	f	20	240	0	Dark	1	8544	26	0	50	0	0	30	0	0	0	30	10	{}	无	fengli	85	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui5oygi000d11mympx04zbv	哥布林老大	Boss	f	40	560	0	Fire	1	0	40	0	40	0	0	75	0	9	0	10	5	{}	无	fengli	84	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui5ckiy000711my8nvvvsoc	诡谲的结晶	Boss	f	24	255	0	Dark	1	0	0	0	0	0	0	0	0	4	0	5	15	{}	无	fengli	83	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui7972v000x11mygbn4skgm	狂暴龙	Boss	f	60	960	0	Earth	1	0	60	2	60	2	0	45	0	0	0	1	1	{}	无	fengli	82	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui765bp000v11myatj0el9t	甘瑞夫	Boss	f	58	1150	0	Earth	1	0	232	1	58	1	0	43	0	23	0	25	1	{}	无	fengli	81	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusd5unt000011x4y11ayyhe	哥布林大哥	Boss	f	70	2400	0	Fire	1	0	140	1	210	1	0	157	4	0	0	10	20	{}	无	fengli	80	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdj1sy000311x4kncp7jb3	奴雷德斯	Boss	f	76	5360	0	Dark	1	0	152	23	152	23	0	57	0	13	0	2	3	{}	无	fengli	77	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdojrh000511x43obnruzj	葛瓦	Boss	f	82	5000	0	Normal	1	0	41	3	41	3	0	246	5	5	0	10	10	{}	无	fengli	75	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdr2hb000611x4c0fujm0s	魔形机壳	Boss	f	85	7900	0	Dark	1	0	255	3	255	3	0	64	0	5	0	1	1	{}	无	fengli	74	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdtmw9000711x4k88rg3j7	虚假黑骑士	Boss	f	88	6600	0	Dark	1	0	176	23	176	23	0	231	12	2	0	30	30	{}	无	fengli	73	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdwmh4000811x43ejfjs8y	魔晶兽	Boss	f	91	6300	0	Dark	1	0	274	3	320	3	0	136	0	25	0	30	35	{}	无	fengli	72	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluse9wij000a11x4unrim046	黑暗骑士因扎尼奥	Boss	f	94	5500	0	Water	1	4890000	212	3	188	3	0	176	3	10	0	35	15	{}	无	fengli	71	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv8eh550003u048e76ibdxs	佐尔班	Boss	f	95	3900	0	Wind	1	2440000	196	3	392	3	0	588	6	0	0	1	1	{}	无	fengli	69	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv8ijit0005u048knmhxyp9	薄暮巨龙	Boss	f	100	8000	0	Normal	1	0	180	4	260	4	0	255	6	12	0	20	30	{}	无	fengli	68	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv8pnax0007u048t9c16ckd	红晶魔蛛	Boss	f	100	4400	0	Earth	1	0	140	4	110	4	0	300	5	10	0	20	15	{}	无	fengli	67	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluqevnyg0009pzxgc2vnj27i	蒙面战士	Boss	f	67	4300	0	Fire	1	0	134	2	134	2	0	200	4	4	0	25	25	{}	无	fengli	66	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv8t0860009u048a24icquk	嗜人蝎狮	Boss	f	100	14400	0	Normal	1	0	220	4	242	4	0	248	3	9	0	20	40	{}	无	fengli	65	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv8uzts000bu048su2ccp8x	魔晶炮手	Boss	f	103	7610	0	Normal	1	0	216	4	247	4	0	123	1	20	0	40	50	{}	无	fengli	64	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv90elr000du048hics57c5	战将复制体	Boss	f	106	8700	0	Fire	1	7800000	371	20	392	15	0	238	0	20	0	35	35	{}	无	fengli	62	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv969jf000hu048anlwmncr	格雷西亚复制体	Boss	f	109	8150	0	Fire	1	0	164	35	218	35	0	302	5	5	0	35	40	{}	无	fengli	61	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvahldr000lu048n8tnj407	机甲狮将	Boss	f	115	6250	0	Earth	1	0	161	4	138	4	0	275	10	5	0	0	0	{}	无	fengli	60	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvgo77p000nu048109v4tal	约克	Boss	f	118	6800	0	Normal	1	0	295	4	118	4	0	275	10	5	0	40	0	{}	无	fengli	59	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv98k6v000ju048zq3nfgym	合成魔兽	Boss	f	112	6000	0	Fire	1	0	179	4	158	4	0	185	5	5	0	30	15	{}	无	fengli	58	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvh0ial000ru048060ee4vn	半魔像暴君	Boss	f	121	8400	0	Normal	1	0	61	4	61	4	0	543	6	10	0	10	10	{}	无	fengli	56	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvh2f6u000tu0488nxl4vy8	龙兽半魔像	Boss	f	124	12240	0	Normal	1	0	248	15	372	15	0	186	2	20	0	50	50	{}	无	fengli	55	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvh7gh1000xu0487ukrqnob	扎哈克半魔像	Boss	f	130	6000	0	Light	1	0	1000	5	1000	5	0	0	5	10	0	2	1	{}	无	fengli	54	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvh4hnn000vu048647dpkg4	妖精兽拉瓦达	Boss	f	127	6000	0	Light	1	0	381	15	445	15	0	228	2	7	0	30	40	{}	无	fengli	53	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvha2u2000zu04891jyz3wc	重装魔偶·蓝	Boss	f	133	6200	0	Wind	1	0	399	80	0	80	0	299	0	0	0	5	5	{}	无	fengli	52	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhbmid0011u048wsgycyt1	重装魔偶·黄	Boss	f	133	6200	0	Wind	1	0	399	55	0	55	0	299	0	0	0	5	5	{}	无	fengli	51	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhcvnx0013u048kumee5cx	重装魔偶·红	Boss	f	133	6200	0	Normal	1	0	399	30	0	30	0	299	0	0	0	5	5	{}	无	fengli	50	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhfck00015u048idz8xt7f	怪穆尔	Boss	f	136	8100	0	Earth	1	0	204	5	204	5	25	204	5	15	0	1	2	{}	无	fengli	49	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhh45f0017u048xpsrfz4d	终极半魔像	Boss	f	139	10500	0	Normal	1	0	417	10	417	10	15	208	0	9	0	30	15	{}	无	fengli	48	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhlw78001bu0484mat8wmw	剑型曼特恩	Boss	f	143	11000	0	Wind	1	0	400	15	500	15	0	428	0	0	0	5	5	{}	无	fengli	47	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhnyrp001du0482l4o8sdg	香菇咪	Boss	f	145	7300	0	Water	1	0	261	5	290	5	0	434	11	0	0	20	25	{}	无	fengli	46	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhplet001fu048asp0pkgn	结晶泰坦	Boss	f	148	9300	0	Dark	1	0	592	25	448	25	0	111	0	9	0	30	25	{}	无	fengli	45	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhk34o0019u0488ip7hlko	奥恩拉夫	Boss	f	142	8700	0	Light	1	9500000	107	5	710	5	30	692	15	5	0	1	1	{}	无	fengli	44	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhx0r9001hu048vx81qiei	薇芮娜·柯尔连生体	Boss	f	150	30000	0	Fire	1	0	300	6	200	6	0	75	0	7	0	10	5	{}	无	fengli	43	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluvhzf33001ju048wrkhjt2r	柱状·柯尔连生体	Boss	f	145	9300	0	Dark	1	0	290	5	290	5	0	109	0	7	0	5	20	{}	无	fengli	42	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6ka17y0001wv1fy5sj57bv	齐尔布兹	Boss	f	154	11100	0	Light	1	1600000	539	6	462	6	10	116	10	10	0	20	20	{}	无	fengli	41	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6kgpjy0003wv1f2yl2xszc	马尔杜拉	Boss	f	157	8100	0	Light	1	0	157	6	393	6	10	470	15	1	0	5	5	{}	无	fengli	40	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6kuovw0005wv1fex3b30tk	泽雷萨乌迦	Boss	f	160	15300	0	Light	1	0	320	6	320	6	25	240	10	10	0	10	20	{}	无	fengli	39	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6kyheu0007wv1f5wpb3zv4	皮多大王	Boss	f	163	12000	0	Water	1	0	789	15	244	15	10	122	5	20	0	30	30	{}	无	fengli	38	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6nykby000dwv1f0psvbizc	魔蚀皮鲁兹	Boss	f	172	0	0	Fire	1	0	602	26	498	26	20	258	1	0	0	20	5	{}	无	fengli	35	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6th6cu000fwv1fje7s1gmj	结晶兽	Boss	f	175	20200	0	Dark	1	0	437	7	437	7	10	655	2	0	0	5	5	{}	无	fengli	34	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6ttfvh000jwv1fczqjwzxb	扎菲洛加	Boss	f	181	20270	0	Dark	1	3800000	315	7	315	7	20	135	0	10	0	5	10	{}	无	fengli	31	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6usbws000vwv1f8l91l44n	皮斯泰乌鱼	Boss	f	193	11300	0	Water	1	0	386	7	482	7	0	433	8	0	0	10	15	{}	无	fengli	27	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6v144a000zwv1frhv71fxi	王座柯尔连生体	Boss	f	190	0	0	Normal	1	0	665	7	475	7	25	285	0	6	0	5	20	{}	无	fengli	26	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6y9m8z0027wv1fu3g36iei	萨波	Boss	f	256	22100	0	Water	1	0	896	10	640	10	30	576	10	5	0	5	10	{}	无	fengli	5	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6ubaz1000pwv1fgzxpbjxd	魔人库维扎	Boss	f	185	40500	0	Dark	1	0	925	7	925	7	25	415	5	0	0	5	5	{}	无	fengli	2	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdaqt3000111x4pvyfke02	石柱魔像	Boss	f	70	3600	0	Earth	1	0	140	2	140	2	0	11	0	30	0	25	25	{}	掉落的盾牌挺好看的	fengli	79	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui643uc000h11mywjwinn7i	毛咕噜	Boss	f	43	620	0	Wind	1	0	0	1	0	1	0	64	12	0	0	100	5	{}	掉的帽子挺好看的	fengli	88	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6wboec001lwv1ftpa30r93	威琉魔	Boss	f	223	20600	0	Normal	1	0	892	8	892	8	25	334	0	30	5	5	10	{}	按距离变色，紫色抗性增加	fengli	16	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6vcla70015wv1f003qb6ks	塔利结晶兽	Boss	f	202	13420	0	Wind	1	0	606	8	606	8	20	303	10	1	0	5	25	{}	开局释放天火和风刃完毕前，暴击抗性为100	fengli	22	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui5gbc3000911my2wys3fo7	森林巨狼	Boss	f	30	300	0	Wind	1	0	30	0	30	0	0	45	0	6	0	20	10	{}	巨大的狼	fengli	90	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6xkuou001zwv1fvj8ksq3a	恶龙法奇诺	Boss	f	244	25870	0	Dark	1	6100000	488	9	854	9	40	367	0	5	0	1	1	{}	小怪存在时，限制伤害，无法被昏厥、翻覆	fengli	9	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdm1jk000411x4v1xuk3ay	翡翠鸟	Boss	f	79	8400	0	Wind	1	0	158	3	198	3	0	177	0	50	0	40	40	{}	受控后一段时间内闪躲率提升	fengli	76	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6y2u4t0023wv1f6o35glva	乐龙雷多尔基	Boss	f	250	28900	0	Normal	1	7000000	500	10	875	10	35	375	0	0	0	3	5	{}	受到翻覆后会反击（即使翻覆由boss自身的技能施加）	fengli	7	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clusdg36i000211x4tyfrqovq	草龙耶弗	Boss	f	74	5040	0	Earth	1	0	146	2	219	2	0	87	0	30	0	100	100	{}	受到的单次伤害过高时会提高自身抗性，可以对其施加麻痹等异常接触	fengli	78	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
cluv7thfi000764bckwgsirxk	地狱三头犬	Boss	f	97	9220	0	Dark	1	0	146	3	146	3	0	255	6	12	0	20	30	{}	受到控制后会改变自身属性	fengli	70	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6um51d000rwv1f4aqjbn5m	伏地蛇	Boss	f	187	24760	0	Dark	1	0	467	7	467	7	25	336	0	0	0	5	5	{}	受到单次伤害超过一定值以后会改变自身属性，提高暴击抗性并限制自身受到的伤害额度。60%血以上时变属为火属性；60%以下变为无属性。	fengli	29	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6vgjhg0017wv1fkdtn4tb8	移儡原生质体	Boss	f	205	14460	0	Normal	1	0	922	8	307	8	100	307	0	25	0	1	1	{}	受到冰冻后，暴击抗性降低为零；生命值降低至75%以下时，属性变为风属性	fengli	21	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6v9cog0013wv1f6vymc7ea	黑影	Boss	f	199	12500	0	Dark	1	0	398	7	597	7	10	298	4	4	0	10	10	{}	受到伤害累计超过一定值后属性变更为火属性。	fengli	23	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6vuo5d001fwv1fg5wuac1z	卒龙灾比欧	Boss	f	214	16200	0	Normal	1	0	642	8	535	8	20	642	10	0	0	10	5	{}	单次伤害超过50万会召唤小怪。	fengli	18	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6l4vfl0009wv1f55hypfwe	暗龙费因斯坦	Boss	f	166	14000	0	Dark	1	0	246	6	249	6	0	25	1	1	0	1	10	{}	半血后获得高额暴击抗性，受到控制后可解除一段时间	fengli	36	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6l98a5000bwv1fn2zs6knp	修斯古巨兽	Boss	f	169	13300	0	Earth	1	0	422	6	263	6	0	253	4	0	0	5	20	{}	半血后增加对物理、魔法伤害的暴击抗性	fengli	37	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui55nha000111myotjx9ia0	科隆老大	Boss	f	10	30	0	Earth	1	1000	7	0	7	0	0	11	0	0	0	10	10	{}	劳大	fengli	87	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6xtcs70021wv1fnuz01uwx	伽拉木瓦	Boss	f	247	26400	0	Wind	1	6260000	494	9	988	9	35	444	10	0	0	10	5	{}	仇恨目标距离太远时，会转移到地图右侧，并暂时无敌。	fengli	8	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6u8d9t000nwv1fjbmbyohh	佛拉布喇·远	Boss	f	184	19190	0	Normal	1	5150000	184	7	736	21	0	552	21	0	0	100	100	{}	仇恨值目标在7m外时的状态	fengli	30	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clv6u40id000lwv1fw2chusr7	佛拉布喇·近	Boss	f	184	19190	0	Normal	1	5150000	552	21	184	7	0	276	0	14	0	100	100	{}	仇恨值目标7m内时的状态	fengli	32	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
clui7ar0n000z11my9mm10x0r	恶魔之门	Boss	f	60	1440	0	Dark	1	0	180	2	180	2	0	0	0	0	0	1	1	{}	不会动	fengli	89	system	cluhz95c5000078elg5r46i83	cluhz95c5000078elg5r46i83
\.


--
-- TOC entry 3615 (class 0 OID 16700)
-- Dependencies: 260
-- Data for Name: statistic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statistic (id, "updatedAt", "createdAt", "usageTimestamps", "viewTimestamps") FROM stdin;
0	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
1	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
2	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
3	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
4	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
5	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
6	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
7	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
8	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
9	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
10	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
11	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
12	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
13	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
14	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
15	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
16	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
17	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
18	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
19	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
20	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
21	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
22	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
23	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
24	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
25	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
26	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
27	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
28	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
29	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
30	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
31	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
32	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
33	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
34	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
35	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
36	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
37	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
38	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
39	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
40	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
41	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
42	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
43	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
44	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
45	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
46	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
47	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
48	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
49	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
50	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
51	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
52	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
53	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
54	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
55	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
56	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
57	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
58	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
59	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
60	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
61	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
62	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
63	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
64	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
65	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
66	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
67	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
68	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
69	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
70	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
71	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
72	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
73	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
74	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
75	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
76	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
77	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
78	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
79	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
80	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
81	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
82	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
83	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
84	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
85	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
86	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
87	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
88	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
89	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
90	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
91	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
92	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
93	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
94	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
95	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
96	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
97	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
98	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
99	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
100	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
101	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
102	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
system	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
testMainWeaponMDstatistic	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
testSubWeaponstatistic	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
CrystalArmasitstatistic	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
testBodyArmorstatistic	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
testTMNAddEquipment	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
testDXTDSpecialEquipmentstatistic	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
testCharacterstatistic	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
testPetstatistic	2024-04-11 07:47:29.523	2024-04-11 07:47:29.523	\N	\N
\.


--
-- TOC entry 3610 (class 0 OID 16385)
-- Dependencies: 215
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, "emailVerified", image, "roleType") FROM stdin;
cluhz95c5000078elg5r46831	KiaClouth	clouthber@gmail.com	2024-04-28 03:57:29.629	\N	USER
clwu10qok00056vladmyfmmrb	大尾巴猪	\N	\N	http://thirdqq.qlogo.cn/ek_qqapp/AQKK7RCI3eMNSh6ssAiaxqmX3ls8icMO7lQZog5gkyOLhzR42o6SyF6bMgBz1QECxRVOSoxodF/40	USER
cluj6sptk0000e10ge9wetfz8	KiaClouth	591519722@qq.com	2024-04-11 07:47:29.523	\N	USER
clujlndnd0000zkw9d9qfsmgz	KiaClouth	mayunlong16@foxmail.com	2024-04-07 10:46:23.639	\N	USER
\.


--
-- TOC entry 3449 (class 2606 OID 16419)
-- Name: account_create_data account_create_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_create_data
    ADD CONSTRAINT account_create_data_pkey PRIMARY KEY ("accountId");


--
-- TOC entry 3446 (class 2606 OID 16398)
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- TOC entry 3451 (class 2606 OID 16426)
-- Name: account_update_data account_update_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_update_data
    ADD CONSTRAINT account_update_data_pkey PRIMARY KEY ("accountId");


--
-- TOC entry 3458 (class 2606 OID 16713)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 3453 (class 2606 OID 16524)
-- Name: mob mob_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mob
    ADD CONSTRAINT mob_pkey PRIMARY KEY (id);


--
-- TOC entry 3456 (class 2606 OID 16706)
-- Name: statistic statistic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistic
    ADD CONSTRAINT statistic_pkey PRIMARY KEY (id);


--
-- TOC entry 3444 (class 2606 OID 16391)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3447 (class 1259 OID 16855)
-- Name: account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "account_provider_providerAccountId_key" ON public.account USING btree (provider, "providerAccountId");


--
-- TOC entry 3454 (class 1259 OID 16864)
-- Name: mob_statisticId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "mob_statisticId_key" ON public.mob USING btree ("statisticId");


--
-- TOC entry 3442 (class 1259 OID 16854)
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- TOC entry 3460 (class 2606 OID 16906)
-- Name: account_create_data account_create_data_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_create_data
    ADD CONSTRAINT "account_create_data_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3461 (class 2606 OID 16911)
-- Name: account_update_data account_update_data_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_update_data
    ADD CONSTRAINT "account_update_data_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3459 (class 2606 OID 16891)
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3462 (class 2606 OID 17051)
-- Name: mob mob_createdByAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mob
    ADD CONSTRAINT "mob_createdByAccountId_fkey" FOREIGN KEY ("createdByAccountId") REFERENCES public.account_create_data("accountId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3463 (class 2606 OID 17041)
-- Name: mob mob_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mob
    ADD CONSTRAINT "mob_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public.image(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3464 (class 2606 OID 17036)
-- Name: mob mob_statisticId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mob
    ADD CONSTRAINT "mob_statisticId_fkey" FOREIGN KEY ("statisticId") REFERENCES public.statistic(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3465 (class 2606 OID 17046)
-- Name: mob mob_updatedByAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mob
    ADD CONSTRAINT "mob_updatedByAccountId_fkey" FOREIGN KEY ("updatedByAccountId") REFERENCES public.account_update_data("accountId") ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2025-02-28 15:45:16

--
-- PostgreSQL database dump complete
--

