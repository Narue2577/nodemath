'use client'

import Image from "next/image";
import Link from "next/link";


export default function SecretAdmin() {



 return(
    <>
    <Link href="" className="grid text-center justify-items-center">
    <Image
                src="/swuEng.png"
                width={150}
                height={150}
                alt="SWU Logo"
              />
    </Link>
    </>
 );   
};
