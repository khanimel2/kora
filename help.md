0:00
Hello and welcome to another Sulana tutorial. Today we're going to talk about Kora. Finally, an advanced topic
0:08
again. Now that I've been doing all the basic videos for the past month, we can go back to exploring cool things that
0:15
exist in the Salana ecosystem. One of which is Kora. Kora tries to solve a
0:21
problem that some developers and users including myself are having and I'm sure
0:28
other users and developers struggled with that too and there have been
0:34
several solutions for it but now with Kora we have an official one from Solana
0:40
Foundation so I want to explore this but first let's have a look at the problem
0:46
what are we trying to solve on Solana when you and the transaction, you need
0:51
to pay a transaction fee. And this transaction fee is always paid in Soul.
0:57
And now that can be a problem if you, for instance, don't have Soul. You might
1:03
be new to Solana or just created a new wallet and received some USDC payment
1:09
and then there's just a USDC in that wallet and now you want to send it to another wallet and you can't because you
1:15
don't have any soul and you can't even do a swap from the USDC to salt because also for that you need a transaction
1:22
that you can't pay for and there have been solutions for that gasless swaps and whatever but it's not just swaps.
1:29
Maybe you don't want your users to hold on. Maybe you're developing a game and you have an in-game currency and you
1:35
just want the people to have self-custody of their assets, but all of your in-game assets are independent of
1:41
soul. And for your game to work and the user not having to fund the wallet to play your game, you could be funding the
1:48
transaction fees for any kind of interaction that the user does in your game. So yeah, there are several use
1:54
cases why you want to have an external fee payer that can pay you a transaction
1:59
fee such that the users don't need to have soul in their wallet or the user's
2:05
soul is not accessible for instance if their wallet got bricked and that was
2:10
also the first implementation that I did of the Solana recovery tool which was basically just a tool to allow another
2:18
fee payer because one wallet couldn't fee pay anymore because it was bricked.
2:24
Pretty much exactly the same use case. You can't access your soul, but you want to still fund the transaction. So, our
2:31
recovery tool is basically doing exactly that. And with Kora, you can also do
2:36
that. So, today we're going to have a look at Kora, how it works, and we're going to set up our own Kora RPC and
2:42
interact with it just to get a feeling of what this really is and how it works.
2:48
However, this is not a super deep dive. This is just a getting to know Kora kind
2:53
of video. We might do a separate video where we really look at the implementation and dive deep. But for
3:00
today, my goal is just to get it working and see it in action. So let's have a
3:06
look at Kora. Boom. Here we go. This is the Solana Foundation GitHub Corora
3:12
repository. They say it's an implementation of a Solana relayer. And this repository provides a library and
3:19
CLI create in order to enable signing experiences on Solana. Great. So there
3:25
is a TypeScript SDK Cora Solana signing infrastructure. It enables guessless
3:31
transactions where user pay fees in any token for instance USDC or bonk or our
3:36
native token or handle any transaction signing that requires a trusted signer. So many things that we see here. For
3:44
one, Corora allows to pay with a token for the transaction fee. So that's use
3:49
case number one. It's basically a tiny swap of USDC or some other token that is
3:56
then used so you pay in the token and then the signer containing the soul will
4:01
pay for the transaction fee. I'm pretty sure that you could also set it up in a way where users don't need to pay, but
4:07
it just signs specific transactions. So you check that what they're signing is
4:12
actually something that you want to sign for instance your in-game stuff and those transactions you then fee pay for
4:19
as the quarter server or then they also talk about those trusted signers. So you
4:25
could imagine something like your program might need a specific authority to sign and that is your corora server.
4:33
So the Corora server does some checks before it signs or co-signs that
4:39
transaction. So Corora could also just be used to get an additional signature into your transaction. Okay. Why Kora?
4:46
Users never need Saul. That's great. That was one of the core motivations that we outlined in the beginning.
4:52
Revenue control. You can define which token you collect the fees in. It's
4:58
production ready which means the implementation here has rate limiting
5:04
monitoring and so on and it's been audited. There has been an audit easy
5:09
integration with an RPC API and the TypeScript SDK. So TypeScript SDK we can
5:15
work with it with a kit and JSON RPC API. Basically what we're doing is we're
5:21
replacing our regular RPC with this Corora RPC and so to the user it's just
5:27
another RPC address and then the RPC so the corora RPC takes care of the
5:34
transaction signing and we have flexible deployment from docker or whatever there's different ways to sign with we
5:42
can use private keys turnkey privy different ways of authentication that is
5:48
helpful If you want to use the trusted serer so that only the authenticated entities get to sign with this trusted
5:55
signer and again flexible deployment options and that's where it gets interesting. We can configure some
6:00
validation rules like what transactions do we allow to sign and allow list like
6:05
who do we allow to sign it supports token extensions that's great limiting and spend protection. Yeah, don't need
6:12
to go into the details too much I guess. Let's just have a look at it. Let's look at documentation and this quick start
6:19
guide. Okay, maybe this is interesting. The transaction flow. Let's look at it like this. We have the user, we have
6:26
your application, we have Corora. So there must be some Corora service running somewhere and then the
6:33
blockchain itself. So the user initiates a transaction. They press a button. They
6:39
want to do something. The application then generates the transaction including
6:44
the fee token transfer. So we build a transaction that includes an instruction
6:51
where the user wallet sends some token to a wallet that is owned by the
6:57
operators of the Kora service. Then the user signs this transaction. So that's the first signature. But the transaction
7:04
also requires a second signature which is the one from the actual fee payer. So
7:10
it's only a partially signed transaction which is then forwarded to the corora service. Then the service validates that
7:17
if that is a transaction that they actually want to sign and if it is they sign it and return the fully signed
7:25
transaction and then the application can send that transaction to the blockchain. So that's interesting that it goes back
7:32
to the app. I would have imagined that the RPC here sends it directly to
7:38
Solana, but apparently it's coming back to the app and then we get success and with the successful transaction, the
7:45
user wallet will have paid the Corora wallet and the Corora wallet will have paid the network fees to Solana. That's
7:52
what those dashed arrows are. Okay, Corora nodes is what it's called. It's a
7:58
Corora node. Corora cosigns and returns the fully signed transaction back to the
8:03
application. So the application does get the fully signed transaction. So we do get the fully signed transaction back.
8:09
The Corora node doesn't directly interact with Solana. Okay, good to know. Good. I think we just go through
8:15
the quick start guide and create our first guest list transactions in 5 minutes. Yeah. Yeah. Yeah. I think it
8:21
will be more like 30 minutes, but we'll get there. So the basics core is a JSON
8:28
RPC server that provides fee payer services for Solana transactions. The
8:33
core IPC validates client requests based on a configuration. Yeah, we said that. So in this core automal we define which
8:40
programs, wallets, token and so on are allowed and once validated the server will sign the transaction and send it to
8:46
the network. Oh here you say that the server does send it to the network. Here it looks like Kora directly sends it to
8:52
Solana. This quick start will launch local corora server and demonstrate client integration. Let's go through
8:58
this quick start and just see how this works. So we will need the corora cli.
9:04
Let's install that. There we go. We're compiling the corora lip and the cli. And now get the binary. There we go. So
9:12
now we should have kora. Yes. In version 204. So let's see what this can do.
9:19
Guess transaction relayer configuration management RPC server operations core
9:25
RPC start the RPC server initialize. Interesting. So that seems to be the
9:32
part where we run a Corora node with this CLI. Do I get that right? Yeah,
9:39
it's the Corora RPC server. Okay, next step. We create a project. We clone the
9:44
entire repository and then go to the getting started demo. Okay.
9:53
So now we have in examples getting started demo. Here we have client and
10:00
server. Let's look at this. We have a quick start. Create a new Kora client.
10:06
Not a Salana client but Kora client. And then get the config. So nothing super
10:12
interesting here actually. And then the full demo the server has this corora
10:18
toml and serer. If there's a ser pool we use round drawing. That's fun. So you can use different signers in your one
10:25
corora node which makes sense. Okay. Anyway let's set this up. We need a local environment. So let's touch an
10:33
env. So we have this environment that just created this file that is empty but
10:40
it will be populated with our setup script. Let's install the client dependencies. So in client pnpm and they
10:48
say I should ignore workspace to avert to avoid some workspace conflicts.
10:54
Whatever I'm just going to do that all right so that got all of the dependencies installed here including
11:00
the kit and kora. Then let's set up the RPC server. So in the core automal we
11:05
can configure all of those things. Let's see. We define a rate limit. We can
11:11
define a different payment address. If you want something else than our serer in a production environment, I would
11:17
recommend to do that unless your server directly needs to work with the funds that it receives. I would send it to
11:22
some other wallet to keep it safe. So to not have the payment wallet be a hot
11:28
wallet that is in operation. The cash. Yeah, I will leave most things with default values. Who here can say which
11:35
methods it allows? Cool. So, validation max allowed lamperts. That's the maximum
11:41
that I'm paying for a transaction apparently. And the base fee is 5,000. So, we have a bit more than that for a
11:48
bit of priority. This is a safety thing, right? I don't want the user to be able to set a priority fee that I would pay
11:55
one soul for that transaction. That would not make sense or that would be an issue for me as the operator of this
12:01
corora node. I say there can't be more than 10 signatures. We will mock our price source. So we
12:08
will just pretend that we have an oracle that tells us the price. If we don't want to mock, we could use Jupiter for
12:16
the actual price source. And we don't allow durable non transactions. And we
12:22
only allow a certain list of programs. And then here we specify which tokens we
12:28
allow and SPL paid tokens. What's the difference? Allow tokens are the wide
12:33
list of tokens that are allowed to be transferred and allow SPL paid tokens. Array of mint address. Your program
12:39
accepts this payment. Okay. So that's the tokens that we allow to be transferred. Apparently nothing else is
12:46
allowed to happen in our transaction. And that's the token mint that we actually accept as payment. Okay. And
12:54
then we can still have a block list, a blacklist. Those accounts are not allowed to interact with our Corora RPC.
13:01
Interesting. Okay, let's set up the signers because our Corora node will need to be able to sign obviously
13:08
because that's the one who's also fee paying. So let's look at the signers toml. What is here? Type memory probably
13:16
means that we have a local key pair. We could define several signers here. And
13:22
the strategy is round robin. So we switch through. We could do random or
13:27
weighted instead. And the type could be turnkey or memory means that it's a
13:32
local key pair. And so we store the private key in our environment variables
13:37
can have private key, turnkey, privy, vault, no sign. And if we have a private
13:42
key, we can use base 58 format a U8 array or even a file where the file
13:49
contains the key pair. Cool. Okay, back to our quick start from project root or anywhere run Solana test validator. So
13:55
we want a local validator but I think instead of doing that instead of a Solana test validator I'm going to use
14:03
surf pool start a surf pool thingy thing cuz same same except I can better look
14:10
at the transactions. Then in the client directory I run PNPM init environment.
14:16
So, we're setting up a local USDC key, a test sender, private key, mint
14:23
authority, destination key pair. So, basically, that's all just keys. Oh, but
14:28
then it doesn't manage to There we go. Now it worked. Mint account created an initialized token. So, 3 NF3
14:36
is now my token. And we dropped some tokens. Great. And in this file, I'm not
14:42
going to show you everything. I mean, it's local. I could show you everything. It's fine. And in this file, so in our
14:47
environment, those private keys were written to now. And the three NFA,
14:52
that's just the keeper that we used to create that mint. So the local USDC. So
14:58
this token is now also what we're going to put in our config as allowed tokens
15:05
to be paid with. And we also need to put it in a list of tokens that is allowed to be transferred. And it even says it
15:12
here that we need to copy that from our environment. That makes sense. Okay, cool. Did that. Then we need to create
15:19
the ATAS. Initialize ATAS is a CLI command of the Kora CLI. This just makes
15:25
sure that I have the token accounts created. So in the server here, I run
15:31
this from the server toml successfully created all ATAs. Perfect. So what that
15:36
does is for all the signers, it creates for all the tokens the ATAS. That's why
15:44
we have a script for that because otherwise that gets a bit annoying if we have a lot of signers and a lot of
15:49
tokens that we accept. Why do you want to create the ATA up front? Well, in order not to have race conditions, the
15:55
first user that sends you something would also need to create the ATA. And if two do that at the same time, it's
16:01
getting weird. So, you better not have one of the transactions that pay the
16:07
coroner node operator have to initialize an ATA. So, you do that up front. That's
16:12
why we're doing this. Okay. And then we start the Kora server. So RPC start with
16:17
this Sinus TOM. Let's start and see what happens. I'm going to make it a bit smaller. There is a lot of warnings.
16:24
We're using the mock source. Yeah, that's fine, but it's not suitable for production. Payment tokens. Funds can be
16:30
seized after payment. Fee pair policy allows system transfers. Users can make the fee payer transfer arbitrarily.
16:37
Yeah. So there we get a lot of security warnings which all make sense. We also
16:43
allow token transfers. So theoretically, we could drain the fee payer token
16:48
accounts. And see, that's another reason why you also might want to have that in a different wallet. All of those
16:54
security warnings probably make sense. And there's a lot of them. And in a production environment, you want to
17:01
avoid all of those. And maybe we will do that in a deep dive video, but for today, it's fine. It's we just want to
17:08
understand the basics. So after all the security warnings, there's even another warning that we specified a weight even
17:14
though we're using round robin. So the weight will be ignored. Yeah, that makes sense. The signers, we said round robin
17:22
and then we gave it a weight. The weight is just relevant for a weighted strategy. Round robin just uses one
17:28
after the other anyway and ignores weight. So yeah, that's another warning. That's fine. And then initializing
17:34
Martisigner, initializing the mainer successfully initiated this guy. And now
17:39
we have an RPC server running and we should be able to use this. So this guy
17:45
now runs and it's basically an RPC. We have a local corora node running here
17:52
that we can now use to pay for our transactions. Let's see in our client
17:58
start does the quick start and the full demo does the full demo. Okay, good.
18:03
Well then let's do the quick start that just gets the config. Let's do PNPM
18:09
start. [snorts] That runs this. And we're getting back the Corora config. That's the fee payer
18:15
again. That's what we created here in our environment. That's what we're signing with. Then the Corora private
18:22
key. So when I query the config from the Kora client, then it returns me this
18:29
because I need to know this because I need to set that as the fee payer in my transaction. We have allowed programs.
18:35
We have allowed tokens and so on and so on. And the block hash surfet safe hash.
18:40
Nice. And now we could do the full demo. That's where then actually gets interesting. Full demo. Let's do full
18:48
demo. And see if Whoa, that was quick. Success. Transaction confirmed. That's
18:56
the transaction. Okay. So what happened here? It initialized the clients. So on
19:01
we connect to the Kora RPC. So that's what's running here. And we see that
19:07
this got a bunch of requests for getting a block hash for assign transaction
19:13
request. And that's cool if you understand a little bit of what's happening here or what's what this is.
19:18
This a base 64 string and it's a transaction and the ace in the beginning
19:25
means that the first signature is all zeros. Then there is a signature that is
19:31
present most likely. When I look at that, it looks like a transaction with a first signer not providing a signature
19:39
yet, which is exactly what we expect because that's just a partially signed transaction. And we send back the
19:46
transaction with this signature. So that's basically what the coral node
19:52
here does. Signed transaction response. So that's what we're sending back, the signed transaction. So now that's the
20:00
transaction. Note that the second part here is the same as this part here.
20:07
Something like this. But we now have not the AAAS in the beginning, but actually
20:13
a signature base 64 encoded. That's cool. So we see our core node has
20:19
returned the signed transaction. So that was the that's the Corora node. the Solana RPC that's what I currently run
20:26
locally here as my surf pool with my surf pool client. So that's that it then
20:31
it was setting up the key pairs. It queried what the signer addresses. It
20:37
created a demo instruction with a token transfer, a sold transfer and the memo
20:42
instruction. It estimated the core of fees for this fee pair and with this block hash and then it locally signed
20:49
this. Then it signed the transaction itself. So it's partially signed with the user and then it sent it to Kora. So
20:56
that's what we then saw here and the transaction was co-signed by Kora and then this transaction was submitted to
21:03
the network and then it was also confirmed and that's the transaction signature the 5KW
21:09
and we also saw that this transaction was actually sent to my local test validator and we can look at that in
21:16
studio. this transaction we see two instructions to the compute budget program then a token program instruction
21:23
where we actually transfer this token my 3 NFA that's my token mint our fake USDC
21:32
essentially and we transfer it to the ATA of the Kora node operator we also do
21:38
a system program transfer I don't know actually where we transfer to to a new account okay and we do a memo hello Kora
21:46
and another token program transfer where we transfer. Actually, I don't know what we're doing here, but I could look it
21:52
up. Let's look up what we did in the transactions here. See, they're using a no op sign such that we can create this
21:58
partially signed transaction. We did talk about this when we talked about signers with the kit in case you're interested. Ah, here we get the payment
22:05
instruction also from Kora. So, Kora the client can return us this instruction.
22:12
So, that's the payment instruction. Okay. And that's the other instructions that we did. So at first we did the
22:19
payment instruction and then we do example instructions of sending 10 USDC
22:25
to a destination replace with generated address to test ATA creation. Then we create a soul transfer from the test to
22:32
the destination key pair and the destination key. Ah that's probably also
22:37
in our environment that one that we just created. Okay that's great and everything. I do not even see the fee
22:43
payer for this one though. So I need to Sana confirm.
22:48
So here we once again see the instructions compute budget token program system program memo program and
22:56
once again the token program and there's two signatures and the first account. So
23:02
that's the signer the first signer and that's also there for the fee payer is
23:08
this one. This one was the corora node operator. Okay, let's see if we can run
23:14
this example also on defafnet such that you could also see the transactions and also that I can look at it in explorer
23:21
properly. So I'm basically just going to replace this with the one for Solana
23:28
both the websocket and the RPC URL. My Corora RPC URL I keep the same and
23:34
Corora shouldn't really care if I sign that transaction for definite or local
23:41
net to Corora. It doesn't really make a difference does it because the only thing that changes is the block hash and
23:47
that's within the transaction. So yeah that's maybe an interesting thing to note. If you set up your Kora for
23:54
Defnet, obviously you will need to fund the wallets for the corresponding
23:59
networks. But yeah, theoretically it should just work for all of them because Corora isn't directly sending it. All I
24:05
need to change is where I submit the transaction to because again, Kora doesn't care about the network. However,
24:12
what I will need to do is I will need to run the setup again. And for the setup,
24:17
I will also need to tell you to do it for defet. But where did I tell you to
24:22
do that? So here in the main HTTP endpoint here I will also tell you to
24:29
use this thing and this thing. I guess we'll see. And the rest should stay the
24:35
same. I'm going to use the same key pairs and everything that I get from my local. I might not be able to get the
24:41
air drops. Let's see. Air drop some soul. So one soul. I'm doing two air
24:47
drops with one soul each. Yeah, but I mean we will see airdrop s to test
24:54
sender and corora wallets. I think for now just going to airdrop to Kora
24:59
wallet. I'll just run this and then we'll see what happens. So let's do PNPM
25:05
init environment again. That basically just runs the setup and
25:10
fetch failed. Make http request fetch failed. Maybe that's the wrong ports.
25:16
Let's try without ports. Nope. Internal JSON RPC error. Maybe you need HTTPS.
25:23
Now I'm getting too many requests. Oh, god damn. But at least that sounds like I'm using the right URL now. And that
25:29
probably just means that my airdrop doesn't work, right? Yeah, because if I would manually try to Solana airdrop one
25:38
soul to this address, I also get this airdrop failed rate limit reached. So
25:44
let's use the foret instead and get this wallet one soul. Okay, then I don't need
25:50
to do this. And I will just go to step four. Execute the initialized token.
25:55
There we go. That works. We dropped that many tokens to this address. So this
26:01
address, the 6pa, that's my user wallet. Now you know what? I like vanity
26:07
addresses too much to not do this with vanity addresses. Now let me quickly do a thing. Solana keychain grind one for
26:16
Kora. I'm just going to replace the key now. And if I read that right, I can just use this form of key pair here. So
26:23
now I changed it to this address. And yes, I'm showing you my private key. I shouldn't do that. Whatever. And then
26:30
I'm going to get myself an Andy wallet there. This will be my local test
26:35
wallet, the test sender. And then I'll also change the mint. Even though I like the 3 GXX as the token, but to make it
26:43
more obvious, let's also grind a key for the fake USDC. Fake USD. There, fake
26:51
USDC. I take it. Okay, now I replaced all of the keys with key pairs that are grinded
26:58
just so it's more clear which account is which. So this is my testing wallet, the
27:05
user wallet, the corora node and therefore also the fee payer will be then this. That's just the mint
27:11
authority and then a random destination wallet. And now with those things where
27:16
I need to fund the Corey wallet while we're here got to airrop a soul into
27:22
there. Perfect. And then I'll run the init script again. Oh no, this doesn't
27:28
work. Invalid value. Okay, I guess Corora will be able to work with this,
27:33
but my setup script might not be able to work with this. I think this is my
27:38
problem now. Yeah, cuz here get or create I create keeper sign of from base
27:45
58. So, let's create it from byes and then I'll just do something like this
27:50
maybe. Let's see. Yeah, that looks better. Look at that. my fake USDC token
27:57
was created and I got tokens dropped into my Andy wallet. So if we look at
28:03
that now and now we're on definite so we can look at this. This wallet doesn't
28:08
really exist because I have no soul on there but I do have tokens in that
28:14
wallet. I do have 100,000 fake USDC. So that's the token that Kora allows to be
28:22
paid with my local Corora. This node that I'm running here. Okay, let's see
28:28
if my Corora is still running. Yep, still running. But it does query surfet.
28:34
Hold on. From that client, Kora client in the full demo. Ah, that's how you
28:40
would use authentication with the Corora service as well. Cool. I still wonder
28:46
why Corora gives this block hash because that comes from Kora now right we have a
28:53
get block hash request received so Kora is still con configured to use local net
29:00
but I don't know where I have configured that also don't know if it's relevant
29:06
because it should also just work for definite the same the thing is just if I
29:11
do a get block hash request that thing then Corora will query the block cache
29:17
and Corora will query it from local and I don't know where I set it up that Kora
29:22
queries local in my full demo where do I get the block I get it from client and
29:28
client is a kora client so no this is not going to work so somehow I need to configure kora to get the block hash
29:35
from somewhere else or I need to build my transaction differently and use not the kora client but those RPC I I mean,
29:44
I'm creating them here anyway. The RPC clients, RPC and RPC subscriptions.
29:50
Could use those instead. Yeah, let's just use the RPC instead, which I don't
29:55
have here. That's annoying. But, and this RPC we then use for sending the transaction, right? Where do we use this
30:01
RPC? Yeah, to send the signed transaction. Every core RPC node must be configured with at least Solana RPC
30:09
endpoint specified via the RPC URL flag or RPC URL environment variable and the
30:15
default is this. Aha. Okay. So when I run my core, I can use the RPC URL. Let's see. Let's kill this RPC start.
30:24
Either I specify the RPC URL here or I put the RPC URL as an environment
30:29
variable. Okay, I'm just going to use for now the D-rpc URL and tell you to go
30:36
to definite. Nope. So, you can have port sign help API key. Nope, it doesn't have
30:43
that. Okay, let's see if I can just put it in the environment and say RPC URL is
30:50
this. Do you think this will change stuff if I do start now? Ah, yeah, there we go. Now I get a different block hash.
30:57
And that's more likely to be from definite. You know what? I'm even going to kill my surf pool and try it again.
31:05
And I'm still getting a block hash. Okay, great. Good. So, my core is now set up for definite. I think we're ready
31:11
for the full demo. That's PMPM [snorts] full demo. Ah, no, we're not ready for
31:17
this. Ah, once again, the environment. We don't like those keys. Okay. Okay.
31:22
Okay. Demo failed. Oh, no. Setting up key pairs failed. Yeah, cuz probably we have the same issue as with the other
31:29
script. Get environment key pair. Yeah, we get it from base 58 encoder and then
31:35
do a key pair from bytes. But really, those are now all just
31:41
8 arrays. So just parse this text and you'll be fine. Okay, try again. Demo demo failed, but we're getting through
31:48
the setting up the key pairs. So we have the send and the destination wallet. And note here because I have everything in
31:54
my environment so it's not clearly split what is what. But in this demo I'm just
32:00
reading the test key and the destination key pair. I'm not reading the corora key pair obviously because only the corora
32:07
node should have access to the corora key pair but we're using the same environment variable. So this demo is
32:13
all it's maybe not ideal for that understanding cuz yeah those things will just be used once the destination and
32:19
the test sender that's what I have access to locally really my client just
32:24
has this I just happen to use the destination as a key pair and not just the address from it and this thing is
32:33
what kora should have access to and the mean authority and the local keeper this can be any token but anyway where are we
32:39
failing now creating Demonstration instructions. This account wasn't found.
32:45
Wait, what is this account? Probably a PDA. Ah, yeah, because we didn't initialize the PDAs. Fair point. There
32:52
was a Corora command for that. What was it? Account not found. Transfer transaction. Oh, even the even Corora
32:59
itself tells me that look, apparently we queried a transaction request, but then
33:06
this account was not found because we didn't initialize the ATAS. So that was with core RPC initialize ATAS and then
33:15
what do you need the signers config is what we provided last time. So
33:21
initialize ATIA with signers config and that's in Sinus TOML. There we go. We're
33:26
finalizing one transaction. Hey all ATA created successfully. Do we see Wait,
33:32
but that was the that's using old tokens. Hold on. Oh, that's right.
33:37
because we still in our config. Hold on. In the com here, we still say, oh, this
33:45
is the token that we allow payment for. Let's also allow payment with this
33:51
token. I'm going to keep the other one, but I'm also going to add this one. There we go. And now, if I save this and
33:57
I run the initialize ATAS again, then ATA already exists for Hey, that wasn't
34:04
it then. So that was not my problem here then. Okay. Demo failed. Type error
34:11
fetch failed. Oh, because now I'm not running my Corora. Okay. If that runs,
34:16
let's try it again. This account not found. Wait, what is this account? What does the Corora server say? We're
34:23
getting a transaction, a transfer request. That's the token and that's the
34:29
source and that's the destination. Or probably the ATA for this token doesn't exist. So why am I transferring this
34:36
token in the full demo? I'm trying to transfer the payment token and the
34:43
payment token it gets from the allowed SPL tokens the first one. So either I
34:50
change and make this the first one or in my demo I say ah take the second one. I want to play with the second one because
34:57
the second one is the one I have or I could also search for it. Whatever. It's just a a demo script, so I'm not too
35:03
bothered about this. I don't want to use the three hey token. I want to use the
35:08
other one. So, let's try that again. There we go. We're getting further. I think demo still failed, but we managed
35:14
to get through step three. We're creating the instructions. And now we're estimating Corora fee and assembling
35:20
payment instructions. This is great that we're going through step by step and seeing what the error is and finding new
35:28
errors. That's how we learn how it works. Because if you just run the demo script and it works, it's like boring
35:34
and we don't learn anything. So that's my fee payer. Corey is the fee payer.
35:39
That's great. That's the block hash. But then we fail because transaction simulation failed. Custom program error
35:47
0x1. Oh, do we do a soul transfer and we
35:53
don't have any soul? That's what we're doing. I think we are doing transfer
35:58
soul from soul mint address interesting a transfer soul we define with this
36:05
token so that thing apparently should create a system program transfer that we get from the client as well eh you know
36:13
what let's not do that because we don't have any soul we don't need to prove that we can transfer soul in the same
36:19
transaction what we can do hold on is to say hey can the signer address please
36:25
send some sort. Let's see if that would work because we got the warnings that we don't disallow that. We should disallow
36:32
that. But just for fun, let's see if that would work. Ah, invalid transaction. Total transfer amount
36:38
exceeds what is allowed. Great. Good that we have this maximum. So yes, we
36:43
are allowed to have the wallet fee pay or also transfer, which is cool because
36:49
then it could also fund token accounts or whatever if we just let that wallet
36:54
fund that token account. But we did specify that as the maximum amount in
37:00
lamperts. So that's 0.002 soul. So fair [snorts] enough. Let's do
37:08
this. Then it's 0.001 001 and see if that would work. Yes. Yes. Look.
37:16
[laughter] Isn't that fun? Transaction confirmed on Solana. Now check this out. We sent a
37:24
transaction as the user the Andy and we don't have any soul on that account. And
37:30
we still transferred some tokens to the destination. Wait, where is that? Here.
37:37
We still transferred some tokens to the ATA of the destination. So that guy, the
37:43
owner, is the destination wallet. We could say that's what we really wanted to do. So our goal was to do a token
37:51
transfer of 10 tokens to the destination wallet. And then since we didn't have
37:57
any soul, we were paying one token. Don't ask me where it got that price
38:02
from. The oracle was mocked. So that's apparently what I needed to pay to the
38:08
Corora wallet. So this one is owned by Corey. That's the ATA of Corey. That
38:14
guy, I needed to pay this many tokens in fake USDC for it to be like, okay, I'm
38:20
fine with that. I can therefore fee pay your transaction. And not only did it
38:25
fee pay my transaction, it even funded this account. So you could imagine that
38:31
would be funding a token account or whatever. It did allow a soul transfer.
38:37
So that's actually quite cool. I like that. And then we even did a memo. Hello
38:42
Kora. That's nice. And so let's test a few things. So those three are the
38:48
instructions that I want to send as the user. The transfer instruction, the
38:54
transfer soul instruction, and the memo instruction. And then in the next step the payment instruction that's what I
39:00
add such that the core node allows to fee pay. So where do I get that we
39:07
estimate the fee and then we get the payment instruction from kora that's a
39:13
get payment instruction for this transaction. So apparently I can just give that transaction and the token I
39:20
want to pay with and then it gives me back it returns me the instruction that I need to add for that to be okay. So
39:27
that's quite cool. That's quite simple. And that's this instruction. Let's see where do I what do we do this then?
39:35
That's the payment instruction. And then we get the final transaction with our instructions and our payment
39:41
instruction. Let's just see what would happen if I would not add this payment
39:47
instruction and I run this then the demo fails because the RPC so that's Kora in
39:56
this case says invalid transaction insufficient token payment that's how
40:01
many we require so once again the 1331 is what we require and that's what Kora
40:07
says sign transaction response for this transaction Insufficient token payment.
40:13
That's how many we required. That's cool. So I need to add this payment instruction otherwise the coroner node
40:20
will not sign it. We also tested that now. Fun. And there's so many more things that we could test. Let's kill
40:27
the server and run it again because all of the security things that we saw earlier. Fee payer policy allows system
40:33
transfers that allow transfer because we set allow transfer to true fee payer
40:39
policy. I could set that to false and restart my server. Then I won't get this
40:45
specific warning. There's still enough other warnings. Allows assign instructions. I will also not allow it
40:52
to assign. I will also not allow it to create accounts and I will also not allow it to allocate in production. I
40:59
don't want any of those things unless I know that my app specifically needs that. But yeah, mainly that transfer I
41:05
disallow now. And then this demo also doesn't work anymore. Now with a reason
41:11
fee payer cannot be used for system transfer. So now I'm not allowed to do
41:17
this instruction anymore here. This transfer soul where I say the signer
41:23
address. So that the corora fee payer address does this. I need to get this
41:29
out and not have those instructions in here. Then the demo will work again. Now
41:35
this works. Now we're just not doing a system program transfer anymore. And the
41:40
Corey wallet just pays the transaction fees. But we still get to send our tokens to the other wallet. And oh, this
41:48
time we paid even more. Why did it get more expensive or did it get less expensive? Oh yeah, it probably got less
41:55
expensive because I'm using less soul. That makes sense. I have to pay less
42:01
soul for stuff. So therefore, I also need to give you fewer tokens to compensate for that. That's fun because
42:08
if I would have a higher priority fee or something that's in the config, the
42:13
price and the limit. If I would, I don't know, 10x my priority price, the compute
42:20
unit price, and I do this again, then I will pay much more in transaction fee.
42:25
This is almost reaching the limit already. So now also the Corey wallet needs to pay more in soul and therefore
42:33
it will also charge me more. Look at that fun. And it does that all automatically because I as the dev just
42:40
need to say, "Hey, give me the instruction of what I need to pay and I'll add it to my transaction." That's
42:47
fun. It's actually pretty easy to use. We didn't look at how that price is
42:53
created through an oracle that we mock for now. there validation price source
42:58
mock. But yeah, that's quite fun. So that was a bit high. Let's adjust this down again. Pay a bit less. Test again.
43:06
And now we're paying a bit less in transaction fee again and therefore also less in tokens. That's cool. And I I was
43:14
again close. It's again the 1331 because we're again paying like last time 001
43:22
plus the 21. Just that this time we're not putting it on another account, but it's all transaction fee. Okay. So,
43:29
let's add a little more. Maybe this. No, it was too much. Way too much. So, let's
43:36
add a little more. Ah, and again, a little more. Ha, there we go. And now
43:41
we're paying that much as transaction fee. And that translates with our mock to this much in tokens. And now I
43:48
finally pay the thing that I wanted to pay. Nice. That's quite cool. We as this
43:54
Andy can transfer around our tokens even though we have zero soul in our account
44:01
cuz all of the fee paying is done by the Corey wallet through this Corora node
44:08
here that I'm running locally. So again, basically I'm fee paying my own
44:13
transactions because I'm running the Corora node. But for a real app, you as the app provider would run this corora
44:20
node and all the users will just use that. So all the users don't need soul and you provide all the soul for
44:26
transaction fees. That's the idea basically. Yeah, I think that's good enough for a first look at Kora. It is
44:34
really simple. We just need to get the payment instruction and add that to our
44:39
transaction and then we can sign transaction with Kora. So get the fee
44:46
payer signature from the Kora node and then we get back the signed transaction
44:51
which we can send to Solana as we usually do. That's quite cool and it's also quite simple. I didn't write much
44:58
code today. I just used this getting started demo. But I hope that you still get the idea of what Kora is and how it
45:05
works. I probably will do another video on this cuz we just scratched the surface of what is possible. The config
45:12
alone, all of the things that you can adjust here in production. You probably want to set it all to false except for
45:18
the things that you know that you really need. But yeah, then we can have a look at how it actually works on mainet and
45:24
with actual tokens. Maybe we want to do that next time with Surfpool and actual
45:30
mainet tokens. But yeah, you can play around with Kora. It's not that difficult. Go through the quick start
45:36
guide or wait for my next video. Yeah, this is really cool tooling because it's
45:41
just one of those use cases that keeps coming up with Solana because we require that transaction fees to be paid in
45:47
Saul. Guestless transaction is just a very handy thing to have from a user
45:52
perspective because then you don't need to worry with Saul. Like most users don't want to even know what Saul is.
46:00
They just want to have their thing work. Most users are not interested in Saul. They're interested in maybe their tokens
46:07
or their in-game assets or their whatever it is that they're working with. So having the infrastructure in
46:14
place that they can just do all the things that they want to do without having to worry about soul or
46:20
transaction fees or anything is quite cool. I don't know if there are any like public cororus services running that
46:26
anybody can use to just do guestless transfers of USDC. Probably some people
46:32
will be running them. I haven't seen anything official though but one could
46:37
have a look otherwise. Yeah, I think it's good enough for a first look at Kora. Let me know down below in the
46:43
comments if you're interested in a more deep dive video where we really write our own code and do stuff with Kora.
46:50
Otherwise, here's some more videos that you can watch. Give this one a like if you enjoyed it. Subscribe if you haven't
46:55
done that yet. And I will see you in the next video. Until then, try out Kora or
47:01
not. But if you watched this far, then you might be interested in it. So, you know, give it a try. It's also just good
47:07
to play around with it to increase your understanding of how Solana works with all the fee payers and stuff and
47:13
whatever and just analyzing the partially signed transactions that are being sent around. For me, that all
47:19
makes perfect sense. But maybe it needs another deep dive for you to really understand it better. Maybe I'm going to
47:25
do that. But not today. Today was just an intro to Kora. And I will see you in the next one. Karen.



Hello and welcome to another Sana tutorial. One more time you'll have to deal with a weird thing under my eye.
0:07
And one more time we're going to talk about Kora cuz last time we talked about Kora. We just did the getting started
0:14
stuff. But this time I have an actual project planned. This time my goal is
0:20
that I'm going to set up a Kora node that supports paying for transactions to
0:25
my program without the user having to pay anything. So basically I want to
0:31
fund the transactions that are only allowed to call a certain program and I
0:36
want to go through how we would set that up. And in case you don't know what Kora is, that's prerequisite for this video.
0:43
Do watch the video that I did make on Kora before because there I talk about what that actually is. This is a
0:50
follow-up video where we're going to dive deeper into how to work with Kora and we're going to set it up to fee pay
0:57
for transactions [snorts] that call a certain program. So what we'll need first is that certain
1:04
program. Let's write the quick program to make it easy for us. We're going to do an anchor program. Fund my
1:10
transactions. Something like that. Not feeling creative. So we have an anchor
1:15
program. Keychain grind fund me. I'll take this target. Deploy key pair. There
1:22
you go. And the new anchor has a key sync. But here I still need to do it manually, which is two clicks. I can do
1:29
that. And while we're here, get one for Kora. Get one for me and you. I like
1:35
this one for me and you. And I think I'm going to work on definite today. Okay.
1:40
And you. Maybe I'm going to have that my user wallet. And this is going to be my
1:46
deployment wallet. So, we got to fund it cuz Anka is expensive still. I'm very
1:52
human. Okay, good. What does the program do? Just log something for now.
1:57
Basically, this is just a placeholder program where you would have your
2:02
program functionality. Maybe we'll add some more functionality, but for now, it's fine if we just have an instruction
2:08
that prints a message, whatever. and we anchor build and anchor deploy this.
2:14
There we go. Program deployed. Now for the actual Corora server. I do have the
2:20
Kora CLI. Still have that from last time. So I think all I need is the Kora
2:27
config like we had last time in the getting started example. The Corora
2:34
automal and the sinol. I think all I need is those files. Yeah. configuration
2:40
must be configured with an RPC endpoint, the signers and the corora toml. And
2:47
this thing didn't work last time for me. Maybe I did it wrong. We said we need
2:52
the corora toml and the signers toml.l. So let's get those. And maybe I'm just going to borrow them from last time.
2:58
This time I do want a different payment address as well. Pay the corora service.
3:04
How about that? So the payment address will be this without chasing. And I have the key for that as the Corora operator.
3:11
But it's not a hot wallet. I don't need to give the Corora node this key. So we
3:16
enable the cache. We enable all of those methods. Yes. Maximum allowed lamperts
3:23
like last time. Why not? Maximum signature is 10. Okay. Now the price source mock. This we need to figure out
3:31
how we can change the price. And for allowed programs here, I don't allow any
3:38
of those. I mean, it's difficult because I would like the compute budget and the
3:44
memo program. I should allow those, but I don't want to fund transactions that
3:50
just use the memo program and the compute budget program. Really, what I would like to have is my program must be
3:58
used. So, that's our program that we fund. But I don't want to allow people
4:04
to do transfer tokens with my Corora service because I don't want to pay for that. I don't want people to be able to
4:11
do that. And I don't think there is a possibility for me to say I must have this program. The only way is to not
4:19
allow other programs. But I do want to allow the compute budget program. And fine, if you want to send a memo on my
4:25
cost, do it. But I'm not going to allow any tokens. And here it also gets interesting. How am I going to get paid?
4:32
I don't know. I also don't block any accounts. So, we'll need to see about that. How we can set the price to zero
4:41
or not require any payment. That's the entire goal for today. How do we set
4:48
this up? And then we've already disallowed the system program things. We
4:54
will not allow it to. And maybe I will need to add the system program back into
4:59
my allowed list again. And I will just not allow it to do any of those things.
5:04
I can also here just not allow transfers and burns and the proofs and everything
5:09
and then it's fine and I can keep the token program in my list. The same for
5:14
token 2022. I just don't allow that program to do anything. Okay. Ah, there we go. The validation price type margin
5:23
there is free. I could have a fixed. That's interesting. Hold on. There must be docks on this cuz that looks like
5:30
either I don't take anything and I just do it for free. Margin means I guess
5:37
something like a number of percent of how much I have to pay for it. So in
5:43
this case I would just take 10% of what it costs me or something like that. Is that what it says? I don't think so. Wait, there must be something else. Or
5:49
fixed is probably a fixed cost per transaction. But there must be docs on
5:54
this. Can I search for docs? Or maybe it's here in the automal payment
5:59
destination address free pricing models. That's all the docs I find. Fees reference there. To estimate fees,
6:07
Corora calculates the total cost for executing transactions on Salana, including network fees, account creation
6:12
costs, and optional payment processing fees. Price model 3 sponsors all transaction fees. You don't have to pay
6:19
anything. That's what I want to do for today. I want to allow my users if they're using my program to fully fund
6:26
that. Fixed charges a fixed amount regardless of network fees and margin oh
6:31
adds a percentage margin to total fees. So margin if I say margin zero then that
6:39
would mean that it just directly one to one covers my cost but I want to have
6:44
some margin for the risk the the conversion cost basically or the risk of
6:50
the asset that I'm getting fluctuating a bit. So a 10% margin like we have here
6:56
seems fair if we add that. If I would add a 100% margin that I would ask for twice as much as it costs me, which you
7:03
know would be also fair enough. But that's what that means, that margin. Okay, cool. It uses the following
7:09
generalized formula. The base fee, the account creation fee, Corora signature fee. What's a Corora signature fee? All
7:16
right, let's look here. The base fee is the transaction fee. That's the 5K lamperts per signature. Account creation
7:23
fee when the transaction creates ATA for instance. Kora signature fee. That's an additional fee when Kora signs as a
7:30
non-participant fee payer. Oh, that uses Solana's. So
7:35
the base fee is not the actual base fee that I was thinking about. That's the entire transaction fee. So that's a base
7:41
fee plus priority is what that thing says. Okay. Anyway, fee payer overflow sum of system transfers from fee payer.
7:49
If from the fee payer I transfer some soul, create account or something. Payment instruction fee is 50 lamperts.
7:57
Wow, that's expensive. No, it's not. Estimated cost of priority fees to add a payment instruction for guestless
8:03
transactions. When a payment is required but not included in a transaction. Oh, that's why we add this. Okay. And then
8:09
transaction fee or transfer fee. Oh, if it's a token 2022 mint that has a
8:15
transfer fee. Okay. Interesting. If I'm getting paid in a token that has a transfer fee, then that fee is added as
8:23
well, which makes sense because doing a transfer costs extra or we lose something of the token. But that's very
8:30
specific to token 2022 only for mints with transfer fee. And margin adjustment
8:36
course pricing model configured margin can add markup as a percent of total fee. Yeah, that's what we specify if we
8:43
use margin and that's how the total fee is calculated if we use that. And so
8:48
that's how it is calculated. If we use margin, margin is best for production deployments where fees should reflect
8:55
actual cost. Fixed pricing, simplified UX and free pricing for promotional campaigns, testing or full sponsored
9:02
applications. I want to have a full sponsored application. I want to have a service where you can call my program
9:08
for free. I pay for it ondefinite. Yeah, that's why I have this critical.
9:14
The fixed of free pricing models do not include fee payer outflow in the charged amount. This creates a significant
9:20
security risk if not properly configured. If a fee payer policy allows transfers or the outflow operations,
9:25
attackers can exploit this to drain your fee payer account. Yes, and even if I disallow that, they can still drain my
9:32
wallet by just having me pay their transactions. That's why we have rate limits as well. But still, we got to
9:39
trust that nobody exploits this or add some pricing. When using fixed free
9:45
pricing, you must configure restrictive fee payer policies to block all monetary
9:51
and authority changing operations like we already did. We disallowed all of
9:57
that. And that would be good. It would be good if we added some kind of authentication such that only
10:03
authenticated people can do that. So, my app would probably want to have that.
10:09
But then again, in our example today, I don't think I'm going to do that. Oh, maybe I will. We'll see. Set low limits.
10:15
Use conservative max allowed lamperts. Yeah, may want to do that. I mean, we are on definite anyway. So, what's
10:22
conservative? That's too low. That's two signatures without priority fee. So,
10:28
let's do 50k at most if you need priority fees. Although, I know we are
10:33
on definite. So 20k will be a good conservative but then I wouldn't support 10 signatures. I will only support two
10:41
signatures actually because I know that in my app you don't need to sign with more than one signer and not even that.
10:49
So two with a fee payer of kora that's enough. Chorus config validator will
10:54
warn you about dangerous configurations. Yeah let's check. We are done here anyway right? We said oh no we're not
11:01
done here. Let's first finish the configuration. So, we said we want it free. So, we don't need to specify
11:06
margin. I could block extensions for token 2022. But I'm not using token 2022
11:13
anyway. So, I can block mint or account extensions. Oh, that's nice. And then usage limit. Maybe I should add a usage
11:22
limit. But for now, let's keep this false. And let's have a look if we
11:27
validate this config the core automo what security warnings we will get. Not
11:33
that many but we have the error of no allowed tokens configured because we
11:39
don't allow any tokens. Again I don't even allow a token transfer. So using
11:44
mock price source not suitable for production. Yeah I mean it's free so I don't need a price source. Missing
11:50
system program in allowed programs. Salt transfers and account operations will be blocked. Yes, I don't want soul
11:57
transfers anyway. And also missing token programs as bare token operations will be blocked. Yeah, that's the whole
12:03
point. Permanent delegate extension is not blocked. I don't use tokens, but just to demonstrate how I would block
12:10
that. The permanent delegate is a mint extension. So, yeah, fine. Let's block
12:16
it. And while we're at it, I also don't like transfer hooks. And then it still says permanent delegate is not blocked.
12:22
Free pricing model enabled. All transactions will be processed without charging fees. Yeah, that is a fair
12:28
security warning, but that's what we want. And no authentication configured. Maybe we do want to set this up just so
12:35
we know how it's done. But first, why do you not like this? Permanent delegate
12:40
extension is not blocked. But I say it's blocked. I don't know. What do I need to do to block this? I don't get it. This
12:48
doesn't seem to work. Ooh, there we have the docs on that operations and configuration. Empty arrays are allowed,
12:55
but you will need to specify at least one wide listed program token and spell paid tokens. You need to specify system
13:02
program token program for the coronal to be able to process transfers. Extension blocking. There we go. All extensions
13:07
are enabled by default. You can block specific extensions by adding them to the blocked arrays. Permanent delegate.
13:14
That's how we're doing it. Available Mint extensions. permanent underline delegate. That's what I have. Why do you
13:20
still complain then? Maybe because I don't even have the aspir token program. Whatever. I'm not having the token
13:26
program in here anyway. What if I add token 2022? Then does it also come with
13:32
that? It also comes with that. So that doesn't really change anything. Okay, never mind. I'm not going to add it. What if I don't specify those two
13:39
things? Missing field allowed tokens. Okay, so apparently we need to allow some token. Fine. Then I will allow USDC
13:48
and I will allow to be paid in USDC but it's free anyway apparently just a
13:54
corora config requires this. Okay, we still don't have any authentication but that's okay for now. And let's move on
14:00
to the signers config. That was just a corora config. Let's add signers
14:06
configuration signers there. Signers signer pool. We
14:11
discussed this with the strategy. Round drawing is fine. And I'll just have one ser anyway. I can also say random, but
14:18
I'll just provide one ser anyway. I don't give a weight because we're not using a weighted strategy. And it says
14:25
it takes it from the environment. Yeah, I'm going to say my cororaigner.
14:32
And then I just create an environment file where the my coreer is with a path
14:38
to the serer. And I have that here. I'm going to copy that to my Corora server
14:44
and then I'll just write that here and my Kora server should have access to that. In a production environment, you
14:50
would maybe put the secret here or something like that. You basically want to make sure that it's not easily
14:55
accessed this key, but for my purposes, this is just fine. And that will do. So,
15:01
let's validate this one more time with the signers config. Configuration
15:08
validation successful. Great. Okay, that's looking good so far. Still get a few warnings, but that's fine. Except
15:14
for this one where I don't understand. Pretty sure it's supposed to be like that, but whatever. Okay, we have signers. We have our config. Let's run
15:22
Kora. So, Kora RPC start with the
15:28
following config, the Kora TOML, and the Sinus config, the Siners TOML. And also
15:35
I'm going to put the RPC URL in here cuz I don't know how else to do this. And
15:42
then we see if that runs. No, it does not. Unexpected argument. Do you need that before the RPC start? Yeah. Okay.
15:52
Okay. Let's look. We have the same security concerns as before. Still the
15:57
free pricing and no authentication. Permanent delegate extension is not blocked. After the validation, we once
16:04
again get the same warnings from Kora when we run it. But then we initialized
16:09
and it seems to be running. Okay, so far so good. How can we now use this? Let's
16:14
go from scratch. What we want to do is call this program. And this program has
16:21
one instruction, the initialize. That's all it does for now. And I could execute it here in the explorer. That's the
16:28
transaction. So basically, that's what we want to do. But we don't want to fee pay ourselves because we will have a
16:36
wallet that doesn't have any soul. So what we want to do is just call this
16:41
instruction. This is so annoying lately. This is just not loading the instruction
16:47
data anymore. Hey, that's literally the one thing that I need my explorer to do
16:52
to give me that. Okay, hold [clears throat] on. I'm going to click the inspect and maybe then I have the instruction data. No, also not. I also
16:59
need to load instruction. What is this? Great that the explorer has new features. Check out the video that I
17:05
made on that. But bad that it suddenly doesn't support the basic features
17:11
anymore. Literally just give me the instruction in raw. What is this? What's the problem with this? If this is not
17:17
working, just going to use a different explorer cuz here I will get to see the
17:24
data for this instruction. That's basically all I wanted. the instruction discriminator for the initialize
17:31
instruction, the AF AAF, we know that the discriminator for initialize. Just
17:36
because I'm too lazy to work with Kodama and get the data from the IDL, I'm just going to manually do it like this. With
17:44
the regular PNPMI Solana kit and then types node as well. Okay, so from the
17:52
kit, we get a Solana RPC. Then we will need a corora RPC. So PNPMI
18:00
was the package kit integration. Create Kora client. Solana corora. Solana
18:06
corora. Import from Solana Corora. Create kit corora client. Nice. Let's
18:13
create a kit corora client. What do you need? The end point be the same as I
18:19
specified for you. Oh, that's the RPC URL. Hold on. That's the RPC URL. The
18:24
endpoint is then going to be where this thing runs, right? So, 8080 localhost
18:31
8080 probably. And this time I'm just going to try and see if I can get it to
18:36
work without looking at the example code like last time where we just used the code from getting started. This time I'm
18:43
trying to build it all by myself. Token program ID, the secret, we don't have
18:48
comput price, I don't want that. API key, we also don't need that. The fee token is required. I still don't get why
18:56
we need to have the fee token. Fine. Have the fee token. USDC, but we're not
19:02
going to pay anyway. Oh, it's an address. Fine. Address. And now add
19:07
missing properties. Feayer wallet must be a transaction signer. So this the fee
19:13
payer wallet is also required. Wallet signer paying SPL fees must be a real
19:21
signer. So the payment transfer is authorized. Okay. So now we will need
19:26
our signer. Okay. Fine. So our signer and this is not the payer even though
19:32
that says fee payer wallet but like it's we're going to get that for free anyway. This is our wallet without funds. I'm
19:39
going to create sign up from byes and those byes I will read from my keys. And
19:47
we had the and you wallet Andy, but it
19:53
could also be your wallet. There we go. We just read that file and create a U
19:59
data from it. And then we create a ser from that. And that ser we can then hopefully put here. Nope. Oh, we need to
20:06
await this. Then we can put it here. Perfect. Good. We have our signer. We
20:12
have the RPC. We have Kora. Now it is time to create this transaction with
20:19
this one instruction to our program. So
20:24
that will be the address of this fund me program. Doesn't need any accounts but
20:30
does need data actually because we want to call the initialize instruction and I used an anchor program for whatever
20:37
reason. So now we will need this data that the explorer doesn't give us still.
20:42
So fine, we'll copy it from here. And here we need to get the base 16 codec
20:49
and encode that. There we go. That's just going to get me the bytes for the
20:55
instruction discriminator, the eight bytes to call the initialize instruction. And then we create a
21:00
transaction as we would okay add all missing imports. So long story short, we
21:06
are getting the block hash. We're creating a transaction message. We're putting our instruction into the
21:13
transaction message. We're signing with our signer. We're adding the block hash.
21:18
And then we sign this transaction ourselves. Wait, this is incomplete now
21:24
though. So this is how we would do it if we had soul and we could pay for it.
21:29
Let's check. So if I now run npxtsx
21:35
use Kora without actually using Kora, this will fail. Transaction simulation
21:40
failed. Attempt to debit an account but found no record of a prior credit. Classic. I don't have no funds. No soul
21:47
on this account. So I can't fee. Okay. But we don't need to fee. In fact, we
21:54
don't want to fee. Our fee payer we can actually get from Kora. Oh, do I also
22:00
need to await this? Corora will have the pay. What is this? No, that's just what
22:07
I put in here, right? Payment address. That's where I want to send to except I'm not sending to anywhere because I'm
22:13
not paying. Why did I specify a separate payment wallet? I don't know. Not using that anyway. Wait, what did I need to
22:20
do? Oh, RPC. Corora RPC. That will have all the things that I want, right? Yeah, there we go. Now, that looks like a
22:26
normal RPC. So, it looks like I don't need this RPC if I have the Corora RPC, but get fee for message. No, it it does
22:33
have the Corora specific things. And what I want is the fee payer address. How did that go? Maybe I do want to
22:40
cheat and look up how it's done in the getting started. We created a new Kora
22:46
client and got the config from it. Do you have a get con? No, you don't.
22:52
creates a Corora kit client composed from kit plugins. Interesting. So, does
22:58
that thing then do all of the things automatically for me already? And I just
23:04
give you the instruction. Well, that would be convenient. Then I don't need to do any of that stuff. I will then
23:10
just say Corora send transaction and you take an instruction plan or a single
23:17
transaction plan. Can I just give you this one instruction? Yeah. Wow. Okay,
23:22
hold on. What am I getting back? A promise for a successful single transaction plan result. Cool.
23:28
Transaction plans. If you don't know what that is, I made a video on transaction plans. Check it out. Very
23:34
interesting thing with a kit. So, we don't need this RPC at all. We just use
23:39
the Kora create kit Kora client and then it behaves like an RPC and we can literally send transaction with this.
23:46
How convenient is that? It only needs to work. Let's see if it does. If I await
23:51
this, then I get a single transaction plan result. Result will have a status
23:58
and the status will be successful because I get a successful single
24:03
transaction plan back. Otherwise, this is going to error already. So great, the status must be successful. The kind will
24:10
be single there. It's also given because I put a single thing in. So I get a
24:15
single thing out. Okay. What else? The message. That's what I sent message with
24:21
fee payer. But I would just really like to have the signature of that transaction. Then it's a transaction
24:28
plan result. Tim, how do you work with this? You know what? I'm just going to log the entire thing and see if that
24:35
works cuz [snorts] it's great that it does it all for us, but it comes with a
24:41
disadvantage that then we have less control, which is also sometimes not good. So okay let's use Kora and this
24:48
fails transaction failed when it was simulated. Okay let's check our Kora
24:55
service we have a get get pay assigner request received get pay assigner
25:00
response. Oh so far so good. Then we get block hash again and get block hash
25:05
response. Okay so far so good. But we don't even send it to Kora because we
25:12
fail before because we can't simulate it. And probably the reason why we can't simulate it is because my Kora wallet,
25:20
this guy doesn't actually exist yet. It doesn't have any soul. So, we will once
25:26
again need to airdrop a little bit to that guy. I'm still human. And a drop
25:34
successful. And now we're going to try this thing again. And do we get the same
25:40
error? Yeah. Transaction failed when it was simulated in order to estimate compute unit consumption. It fails
25:46
somewhere. Failed to execute transaction plan. GH. Well, yeah. So, we have three
25:52
errors inside each other. And the most inner ones transaction failed when it
25:57
was simulated. Okay. I might come back to this, but for now, I want my regular RPC back. I'm not going to use Kora, but
26:05
I'm going to do it the way that the demo did with a Kora client. And here I give
26:12
the RPC URL as well. Okay, fine. Have it. Wait, but the Corora RPC URL URL of
26:21
the Corora RPC server. Hold on. Maybe that's what I was doing wrong. This is confusing. Can I read docs on this for
26:29
the kit? So, the end point. No, the the end point is the Corora RPC endpoint and
26:36
the RPC URL is the Solana RPC for CUS estimation. So I think I was doing that
26:42
right. The RPC URL is the Solana RPC URL, not the Corora endpoint. Okay,
26:48
Corora client use token program. The kit client also exposes the full Corora API
26:54
via Kora names. And maybe that's what I wanted. Maybe the hold on the Kora.cora
27:01
Corora get config. There we go. So let's not call this Kora but call this client.
27:07
It's a bit confusing with the naming but here I get the same thing that the get config and so on. So inside this create
27:14
kit Kora client there is a new Kora client being created with this RPC URL
27:22
or really here this is the URL of the core RPC server. So this is the end
27:27
point. The naming is confusing, but here I get the exact same things as here. So
27:33
that's the same. So I guess that's the same as if I were to do this and then
27:38
get config from here. Should be the same as getting config from here. Let's
27:44
quickly print both of them. Print that and that. And then we see yes, we're
27:50
getting twice the same thing with enabled methods. The fee payers. There
27:56
we go. That's the possible fee pairs and that's the config twice. Very nice. So,
28:02
we don't need to use the Kora client directly as the getting started did. We
28:08
can just create the kit Kora client. That's how you're probably supposed to do it. And then I don't need the RPC
28:15
because the client has both. The client now has the Corora and the RPC. And all
28:21
the RPC stuff I could do from here. and all the Corora stuff I could do from here. Cool. I like that. Okay. So, let's
28:29
still manually build it because something is not quite working if I send the transaction with Kora directly. So,
28:36
let's do it manually. Let's get our fee payer from this config fee payers. The
28:43
first one I know that there's just one. So, I'm just going to take this one as the fee payer. Or is there client corora
28:51
get get pay assigner kit pay assigner response. What is this? Can I set this
28:57
to the fee payer? This is a kit payer signer response. Payer signer. Payer
29:04
signer has the payment address. So where I need to pay to and the serer address
29:10
public key of the payer signer. So I guess that's then my fee payer probably
29:18
or the address that I use as a fee payer. Let's check. I'm not getting anything here. Why am I not getting
29:23
anything? What does the Corora say? Get payer signer response signer address is
29:28
Kora. Payment address is this. But why do I not get it here in my client?
29:34
That's weird. I'm not awaiting this. Yes, I am awaiting this. Why does it not log that? Oops. One more time. Let's
29:40
retry. Nope, it doesn't log any. Oh, did I not save the file? No, I did save the file. Why is Why am I not getting
29:47
anything back from here? What is happening now? I just got that. Hold on. Hello from my script. You tell me what's
29:54
going on here. Oh. Oh my god. Oh my god. Do you see it? I see it now. Oh, how did
30:00
I do that? Somehow with clicking. Clicking. I imported console from
30:06
inspector. Why? God freak. Okay. Okay.
30:11
Okay. that I was doing. Okay, let's try that again. Here we go. That's looking
30:16
much better. Okay. Okay. Okay. So, the things were working. I can get the fee
30:22
payer as well. Don't need to get it from the config. I can get it from this payer signer. It's here. That's my fee payer.
30:30
Okay, good. Wow. Maybe I'm already working on this too long. We need to make progress. So with the fee payer
30:36
that we have now I am going to do that thing as I would usually do with my RPC.
30:43
I'm just going to get that from client and also here. And what I'm going to do
30:48
I'm going to set the transaction message fee payer signer to my fee payer which
30:54
is just an address. Okay. So I will need a pseudo signer create no oper with a
31:02
fee payer address. So okay and this pseudo signer I'll put
31:08
in here as the fee payer because once again I can't sign with this. My corona
31:13
node can but I can't. But I will still need to put it in as a fee payer. Now I don't even sign myself but that's fine I
31:22
guess. I will not be able to sign though. I will need to partially sign
31:28
this. Let's first just simulate it. Client view simulate transaction. This
31:33
sign transaction and an on error we return. We will get an error. Transaction signature is missing. That
31:40
is true. Can I tell the simulation that I don't care about that? Can I say sik
31:46
verify false in the config? I can. But how will that do? Transaction signature
31:52
is missing. They're still missing. I don't verify them, but they're still missing. Is there a simulate transaction
31:58
message? Transaction missing signatures for address. Yeah, that's true. I can't sign for this one. Wait. Oh, I'm not
32:05
even getting here. I think I think I'm failing here because I tried to sign, but I can't. Hold on. I need to
32:11
partially sign here. I need to partially sign transaction message with signers in
32:17
this case. He then I can at least simulate it. Okay, good. So I can
32:23
simulate the initialize this transaction was paid for with Kora, right? Not yet,
32:29
but we're getting there. We don't have an error. So actually that worked, but then we get a Sana error from JSON RPC
32:37
transaction simulation failed. Transaction didn't pass signature verification because if we don't have an
32:42
error and we sent the transaction there again, we do need to do the sik verify
32:49
which we skipped here. If I keep that to true, then it would give me signature failure. Okay, great. So, this is
32:56
working. I love it. Okay, but at least it looks like we could simulate that.
33:02
So, that's not the issue. The instruction here is not the issue. So, now we just need to not send this with
33:11
our RPC, but send it with Kora. So, instead we await the client Kora spread
33:19
with a K dot sign and send transaction and the request is a sign and send
33:24
transaction request that takes the transaction or you just take the message. I need docs for this please or
33:32
I'm going to check the full demo how we did it there. Signed transaction was a base 64 encoded wire transaction. That's
33:39
probably what we need. Okay. So get a B 64 encoded wire transaction from this
33:47
partially signed transaction. I'm going to call this partially signed transaction, which really is an unsigned
33:53
transaction because I'm not even signing it with my serer that I defined up here because this sign isn't needed for this
34:01
instruction, but we'll get there in a second. And by a second, I mean, give me a few minutes. So, this it takes now as
34:08
a string, okay? And it can sign it. I could also tell it which serer I used
34:13
which is probably good practice if I also say the serer key is my fee payer
34:19
address such that it knows which one it actually signed with but I don't think I need that I can also leave that out
34:25
since I do only have one core assigner anyway let's see log done let's see if
34:32
we get there nope cannot read properties of undefined length so the simulation
34:38
checks out but and you're trying to get a signature. Well, I'm just going to add
34:45
this just in case that is what is missing here. But I don't think that's the case now. Nope, it doesn't have the
34:52
signature because yeah, I didn't add the signature, but I thought the sign and
34:57
send will sign and send this, but maybe not. Kit sign and send. Hold on. At my
35:03
Corora, if we scroll down, sign and send transaction response. Okay. And it does
35:10
give me the signed transaction though. Look, I'm getting the unsigned transaction and I'm returning as the
35:16
Corora node the signed transaction, but then it still somehow doesn't manage to
35:23
send this. Okay, hold on. Somehow it's still messing something up. Okay, fine.
35:29
Well, let's try and just get the signature. Let's just do sign transaction. I'll send it myself. So the
35:35
sign transaction request as before will have the transaction and the key. So
35:41
I'll do this there. So the transaction is that and the fee pair is that I await
35:48
this and I get a response kit signed transaction response and this response
35:55
will have the signed transaction which is a base 64 encoded wire transaction.
36:02
You know what? Can I simulate this one again? Then I skip the simulation up
36:07
there. And this time I require a sik verify. Let's see. Yeah, simulation is
36:14
okay. I can simulate this. And apparently that transaction that we're getting back also has the signatures
36:21
present because we said it should s verify. Okay. Well, then let's send this. Let's do it the way we usually do
36:29
it with the regular RPC. send transaction. And this time we don't need to get a B 64 encoded wire transaction
36:36
because it's already here our fully [snorts] signed transaction. And now with the
36:44
fully signed transaction here, let's say transaction sent. And also I can log now
36:52
the get signature from the transaction because now that we have the signature
36:59
of the fee payer, we can log the fee payer signature. But for that we need the fully signed transaction. Oh, that's
37:06
message bytes. What does that give me? Oh, you give me a signature. Okay, wait. I can just get this. This gives me back
37:11
a signature anyway. So I'll just lock this. Okay. And drum roll please. There we go. Transaction sent. Look, we have a
37:19
transaction where the Corora service, so my Corora node signed for this. It paid
37:25
for this and it just calls this program the initialize instruction and I can't
37:30
load instruction data because Explorer is being annoying right now. And this transaction was actually paid for with
37:37
Kora. Nice. And that's how I would from my application send transactions even
37:45
without having soul because I just do the instruction to my program or to the
37:50
program that Kora is funding and then Kora will give me a signature for that and I can send it. So I don't even need
37:56
to have my own wallet. But in a regular case, your program probably would
38:03
require a user wallet. So it would say something like we need a serer and then
38:10
it was requested by and then the user context accounts signer key there just
38:18
so my program does something with a serer. So the fund me program if I build
38:25
this again and deploy this again then obviously this is not going to work anymore because invalid transaction
38:32
custom program error because we don't have a serer we require the serer so in
38:38
the instruction we now need to put the account address my signer address and
38:44
the role will be a readonly signer and with that signer we put it in and then
38:50
We also partially sign. Now that partially sign makes sense because at that partially sign we put in the second
38:57
signature. So the signature of our wallet and it's still failing. Okay.
39:03
Although the simulation was okay there and you was requesting it. But
39:09
transaction simulation failed here because transaction did not pass
39:15
signature verification. Oh wait, I'm not signing with mine. I'm getting the signature from the core I want but my
39:22
signature is still zeros the partially signed transa oh because I'm setting it
39:28
here as a readonly serer but this instruction still doesn't understand that it requires a serer so I need to do
39:35
what was it add serer to instruction the serer to this instruction and then I add
39:43
the instruction with serer down here then that will work that's just how the kit operates try that again Yeah, this
39:49
time is okay. We can also see in our corora this time we are just missing the
39:55
one signature and the second one is already present and then we actually sign it ourselves. And if we look at
40:01
this transaction in the explorer then we see that Kora still paid. It's now
40:06
paying a bit more because we have two signatures and the other guy Andy or you
40:13
still signed because the instruction required that. But it doesn't need to have any soul. This account does not
40:20
need to be funded. It doesn't need to own any tokens. It can just be a clean wallet and this will still work because
40:27
my Corora node will pay for that transactions. Nice. So, we managed to do the thing
40:32
that we wanted to do for today. But I'm still not done because I still want to figure out why this thing isn't working.
40:41
So if I manually do it, if I manually just get the payer add it as a fee payer
40:49
and then I sign the transaction with Kora, then that all works and then I
40:55
manually send it with my RPC. But first of all, why does the sign and send not work? And secondly, why does the Corora
41:03
send transaction thing not work? Because the Corora send transaction, that thing should basically do the same thing. So
41:10
my client if I just say send transaction and I give it the instruction invalid
41:15
account data for instruction. Let's see. Solana foundation corora script SDK
41:21
source kit there the create kit corora client internally creates this kit
41:26
corora client which is so weird that here the RPC URL is that endpoint. The
41:33
naming is is weird, but it's okay because the real RPC URL that I provided
41:38
here in this config is used here. The Solana RPC config RPC. Okay. Anyway,
41:45
what did I want to find the send transaction? Let's see at the actual
41:50
client if that has the send transaction. Sign and send. So, the sign and send
41:57
transaction returns the signature, the sign transaction, and the signup popup key. Nice. But why does it not work?
42:05
Client sign and send transaction. So client sign and send transaction. Does
42:11
this RPC request sign transaction? Okay, let's try that again. Then let's just
42:17
check the sign and send transaction. In this example, we still manually put in
42:23
our fee payer and then we sign and send transaction. And this result should now
42:29
have the signature and the actual transaction and the signup pup key. So
42:34
I'll just lock the signature. And does that work? No. Oh yeah, we had the thing
42:39
with the signature length cannot read properties of undefined. But I think
42:44
it's working though because here we get the sign and send transaction response.
42:50
Okay, that's the transaction. Look, if I copy this and put it for instance in the
42:56
inspector, then it's all valid and that thing does simulate. And also, if we
43:03
check the signatures, the first one, I think that was actually already also
43:08
sent. Check it. Yeah, it was sent. Look, the transaction was sent. That's why it already spent a bit earlier. So, this
43:16
thing is working. I guess there's just still a bug in the kit somewhere. And
43:23
the assert is signature in Kora here in
43:28
the plugin. Corora plugin something something. I think it's trying to read
43:33
the signature because it wants me to have the signature here, but it's not
43:39
getting the thing back in the correct format or whatever. That's why it's dying. It's not managing to get me the
43:46
result. But it does manage to sign and send the transaction. So that actually
43:52
does work. Okay, good to know. But then even one step back when we just say here
43:59
client send transaction and not do the rest transaction simulation failed cause
44:05
undefined inverted account data for instruction. Hey, I do think that that's an error with payment. Hold on. Corora.
44:13
Oh, here is the D-RPC URL. So I could say corora- RPC URL and then the
44:20
commands. Oh, that's why. Okay, that's why it didn't work. So if you ever need to do this again, you can also do it
44:26
here. RPC URL if you don't want to have it in the environment. That would also work. There
44:34
we go. Okay, we also figured that out. But anyway, that's not what I wanted to do. What did I want to do? Create the ATAS. Corora, where was that? Corora RPC
44:42
initialize ATAS. Initialize ATAS. And then signers config probably signers
44:48
config signers toml let's go error invalid token program owner what fail
44:54
token operation failed invalid token program owner I'm going to manually do
44:59
it I'm going to sana config set the keypad to my corora wallet for a second
45:06
because the sppl token still doesn't support that otherwise and we're going to create account for [snorts]
45:13
this token incorrect program ID for instruction. What? What the hell? Oh, maybe. Hold on. Oh, wait. Ah, wait. That
45:21
token doesn't exist on definite maybe. Or on definite it has a different address. Maybe that's it. If I create it
45:30
for this address. There we go. That works. Okay. And now that we have an ATA
45:35
and a valid Mint, I'm going to restart my Chorus server and then I'm going to try this again. Nope. Still doesn't
45:42
work. still invalid account data for instruction. So it wasn't the payment. I
45:48
mean on the one hand I would argue the cleaner and safer way is to do it manually yourself anyway. But there is
45:55
this send transaction functionality. I want to figure out what it does. It's
46:00
not getting to the point where it sends a trans transaction. It just gets the block the payment that is sent and the block hash. But client send transaction.
46:07
Where's it implemented? That's an instruction plans. That's not even a Corora thing. sends a single transaction
46:13
to the network. Well, yeah, obviously that's not going to work then. I thought that was a Corora thing, but it's an
46:18
instruction plans. Well, obviously that's not going to work. I thought that
46:24
we have the Kora client send transaction that sends a transaction with Kora and
46:31
does all of the this stuff itself. But no, that is just for some reason it
46:38
reexports. Don't ask me where it does that, but it reexports
46:44
some stuff from the instruction plans. I wonder how that got in there because
46:49
that's just very confusing. So, never mind that. Don't do that. Just do the
46:55
regular way creating that transaction yourself. Then you have way more control anyway of what your transaction does.
47:01
You put the fee payer yourself, you put the instructions yourself, then you partially signed it yourself and then
47:08
you can use the client chorus sign and send transaction which will fail but
47:14
will still work. [laughter] It will fail but it will still work. Yes, that that's that's it. That's just some type error.
47:21
And if you want it to not crash, then just do it this way where you just sign
47:27
the transaction and then you get the fully signed transaction back there. You
47:32
then have full control to just send it yourself. That's the nicest way to do it anyway. And I guess the sign and send
47:40
does exactly that. Just that it does that all in that one function here and then it crashes. Although no, I think
47:46
it's actually a different function. Yeah, because it's done by Kora. Corora
47:51
will then sign and send the transaction. So, we could even say that we don't allow a signed transaction, but we only
47:59
allow sign and send. That's safer because then the user can't send it late
48:06
or whatever. We're not allowing durable non-transactions anyway, but this way we can make sure that we are sending it and
48:13
we're not just partially signing it. But anyway, I would leave that to true. I'll
48:18
keep it to true such that it all works. Okay, good. I think I'm happy with that.
48:23
We did manage to to set it up in the way that we wanted. Obviously, we only
48:28
tested the happy path for now. What if I wanted to call a different program? No
48:34
fu. If I would deploy this program to the no fund address real quick. So the
48:42
exact same program at a different address and I now want it to do the same
48:48
thing except I'm calling this program then that should obviously not work
48:55
program no is not in the allowed list and my server errors with invalid
49:03
transaction because we configured that we only allow those programs the one
49:08
that I'm funding those two for transaction actions to work normally and the memo because I'm a nice person and
49:15
if somebody just wants to send a memo then I also pay for it. I could remove that. I could be like, "Nope, we don't
49:21
allow memo program either." Would be fine. I should probably do that. But then people could still make me send a
49:28
transaction that has no program in there, right? I would still pay for a
49:33
transaction with no instruction. Is that correct? If I send an empty transaction.
49:39
Oh no. Transaction contains no instructions. Who complains here? Oh, Corora complains if the transaction
49:46
contains no instructions. That's good because that way you can't just drain me
49:51
by making me pay for transactions without instructions. That's cool. Okay, so that's good actually. I like that
49:57
because then I just don't allow anything. Well, I still need to allow the compute budget program though. Even
50:04
if I know I don't need address lookup tables, but the compute budget program would be good. Let's see how smart Kora
50:10
is. At one last thing, I'm done soon. I'm restarting this. And then my only instruction will be a Solana program
50:19
compute budget get set compute unit limit for instance. So my CU limit
50:27
instruction I set it to how many did we need? 375 for those. So let's say a,000
50:36
and then that will be my only instruction. Do you think Kora will let me do that?
50:43
Let's try. Yep, that I can do. Okay, so like this somebody could still drain my
50:50
Corora wallet by making me pay for this transaction. It costs me the base fee
50:56
and I'm paying for it because it only contains allowed programs and it doesn't
51:01
check that it's just compute budget program instructions which might be a little bug or a little improvement
51:07
suggestion for Kora. If you don't allow no instructions, maybe also don't allow
51:13
just compute budget program instructions because then it would be safer for me to use the the free one because I need to
51:22
have an instruction to a program and that's the only program I allow. I can also say I don't allow the compute
51:27
budget program but then you can't use priority fees. Then if I restart the server now then it wouldn't send this
51:34
because compute budget program is not allowed program compute budget is not in
51:39
the allowed list. So it wouldn't sign that but therefore I could also not send
51:45
a transaction to my program if I also want to use the compute budget program
51:51
because still compute budget program. Wait no transaction simulation failed.
51:56
Hold on. I probably need more computes because I'm adding a ser checks. Let's
52:02
see quickly in the inspector if I simulate that. Yeah, but how many compute units would I need? Whatever.
52:09
Set it to 100,000. Then it should be fine. Oh, except this program is still not in my allowed list. I would need to
52:15
go back to the one that I'm actually allowed to call. And then it says the compute budget program is not in my
52:20
allowed list. So, I can't use the compute budget program then. But I think
52:26
you're getting what I'm saying. Now I can only use my program and now I really can only send transactions that only
52:33
contain instructions to that program which on mainet is a bit
52:39
unsafe because without priority fees transactions might not land and that's
52:45
just inconvenient then. So yeah, you want to use the compute budget program.
52:50
But yeah, I have an issue for Kora. maybe as a feature don't allow just
52:55
compute budget program instructions but also in a normal production environment you would let the people pay for the
53:02
transactions but yeah it's also a use case that I want to pay for them that they don't need to have any tokens or
53:09
anything I just pay for those simple transactions to my program that really doesn't do anything anyway but your
53:16
program could right that could be your program that you use for your game or
53:21
whatever that you want to fund the user transactions for such that they don't need to bother with soul or tokens or
53:28
whatever. So yeah, that's that. And since I've been sitting here for 3
53:33
hours, I think I'm going to end it. We did not talk about authentication to the
53:39
Kora node. This would probably be the next step here. just allow certain
53:45
people to use the Corora service if you pay for their transactions because then
53:50
you can pay more as well, right? Pay for creating token accounts and whatever if you have a set of users that that is
53:57
authenticated to do so. That's another use case than the fully free for everyone that I explored today. But
54:04
yeah, that could certainly be something that we still look into. But since today's video is long enough, I think
54:10
I'm going to call it here. And if you want another deep dive on how to do authentication with a Kora client, let
54:16
me know and I might do one. Another thing that we could explore is this open
54:21
for provider cuz for now we've always run our Kora nodes ourselves but there
54:27
is one that is publicly offered I think and we could have a look at that if you
54:32
want to. Otherwise I would say that's good for today and we did manage to set
54:38
up the thing that we wanted to set up. I have a Corora node that just allows instructions to my program and I can
54:46
fully pay for that and the user doesn't need to have any solo tokens whatsoever. It's a very specific use case, but
54:53
that's what we explored today and it's pretty easily set up with Corora. You just disallow all of the other stuff and
55:00
just put your program in the allowed list and that's it. Simple, right? could
55:05
have been a 10-minute tutorial, was a one-hour tutorial, but you know me, I
55:11
like to look at stuff in detail, and I feel like we did that and we understand
55:16
Kora better now, especially also that TypeScript client, how to interact with
55:21
Kora. Good that we tried that out ourselves, writing our own code. Can recommend. So, try out Kora if you're
55:28
into this stuff. Do like this video if you enjoyed it. Subscribe if you haven't already. Here are some more that you can
55:34
watch. This one is the one from Kora last time that you already watched earlier, right? Good. Just in case you
55:41
haven't start there, lol. He says in the end. But good. This is indeed the end. I'll see you in the next one. Bye-bye.