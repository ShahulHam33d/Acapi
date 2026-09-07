"use client"; 
import Link from "next/link"; 
import {FormEvent,useState} from "react"; 
import {useRouter} from "next/navigation";
export default function Login(){const [loading,setLoading]=useState(false),[error,setError]=useState("");
    const router=useRouter();async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);
        try{const r=await fetch("/api/auth/dev-session",{method:"POST"});
        if(!r.ok)throw 0;router.push("/dashboard")}catch{setError("Unable to start the development session.");setLoading(false)}}return <main><h1>Welcome back</h1><p>Development-only authentication</p><form onSubmit={submit}><label>Work email<input type="email" required/></label><label>Password<input type="password" minLength={8} required/></label>{error&&<p>{error}</p>}<button disabled={loading}>{loading?"Signing in…":"Sign in"}</button></form><Link href="/signup">Create an account</Link></main>}
