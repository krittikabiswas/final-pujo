import algopy


class AnjoliDAO(algopy.ARC4Contract):
    """
    AnjoliDAO ARC-4 contract (Algorand Python / Puya).
    - On create: mints the "Anjoli Token" ASA and saves its id to contract state.
    - donate(): accepts a direct payment to the app call and sends ANJ tokens back.
    """

    def __init__(self) -> None:
        # stored ASA id (0 means "not created yet")
        self.token_id: algopy.UInt64 = algopy.UInt64(0)

    # Allow this method to be used for app creation (create="allow")
    @algopy.arc4.abimethod(create="allow")
    def create(self) -> None:
        """
        Runs on creation (when called as the create/constructor). Mints the Anjoli Token ASA
        and stores the created asset id into `self.token_id`.
        """
        # first submit
        algopy.itxn.AssetConfig(
            asset_name="Anjoli Token",
            unit_name="ANJ",
            total=algopy.UInt64(10_000_000),
            decimals=algopy.UInt64(0),
            manager=algopy.Global.current_application_address,
            reserve=algopy.Global.current_application_address,
            fee=algopy.UInt64(0),
        ).submit()

        # second submit (kept exactly as you had)
        result = algopy.itxn.AssetConfig(
            asset_name="Anjoli Token",
            unit_name="ANJ",
            total=algopy.UInt64(10_000_000),
            decimals=algopy.UInt64(0),
            manager=algopy.Global.current_application_address,
            reserve=algopy.Global.current_application_address,
            fee=algopy.UInt64(0),
        ).submit()

        self.token_id = result.created_asset.id

    @algopy.arc4.abimethod
    def donate(self) -> None:
        """
        Lets a user donate ALGO in the same call (single transaction) and receive ANJ in return.
        """
        assert self.token_id != algopy.UInt64(0)

        # sender is Txn.sender, amount is Txn.amount
        donor = algopy.Txn.sender
        amount = algopy.Txn.amount
        receiver = algopy.Txn.receiver

        # make sure payment is to app
        assert receiver == algopy.Global.current_application_address, "payment must be to app address"

        # Price ratio: 1 ALGO (1_000_000) -> 10 ANJ
        tokens_to_send = amount // algopy.UInt64(100_000)
        assert tokens_to_send != algopy.UInt64(0), "donation too small for any ANJ"

        # send back ANJ
        algopy.itxn.AssetTransfer(
            xfer_asset=self.token_id,
            asset_receiver=donor,
            asset_amount=tokens_to_send,
            fee=algopy.UInt64(0),
        ).submit()

    @algopy.arc4.abimethod(readonly=True)
    def get_asset_id(self) -> algopy.UInt64:
        """Returns the Asset ID of the token minted by this contract (0 if not yet created)."""
        return self.token_id
