"""Create / fund / inspect a Stellar Testnet account."""

import sys

from app.services.stellar import ensure_funded, get_server, load_keypair


def create():
    from stellar_sdk import Keypair

    kp = Keypair.random()
    server = get_server()
    ensure_funded(server, kp)
    print(f"STELLAR_PUBLIC_KEY={kp.public_key}")
    print(f"STELLAR_SECRET_KEY={kp.secret}")


def show():
    kp = load_keypair()
    server = get_server()
    try:
        account = server.load_account(kp.public_key)
        balance = account.balances[0]["balance"]
        print(f"Cuenta:  {kp.public_key}")
        print(f"Balance: {balance} XLM")
    except Exception:
        print(f"Cuenta {kp.public_key} no existe en Horizon")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "show"
    if cmd == "create":
        create()
    elif cmd == "show":
        show()
    else:
        print("Uso: python -m scripts.stellar_account [create|show]")
        sys.exit(1)
